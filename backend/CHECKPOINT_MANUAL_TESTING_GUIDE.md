# Task 9 Checkpoint - Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing each role's access to various endpoints to verify the backend authorization implementation is working correctly.

## Prerequisites

1. Backend server is running (`npm run dev`)
2. Database is set up with all migrations applied
3. Test users exist for each role (see setup below)

## Test User Setup

Create test users for each role using the following SQL:

```sql
-- Super Admin
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('superadmin@test.com', '$2a$10$...', 'Super Admin', 'super_admin', NULL);

-- Admin
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('admin@test.com', '$2a$10$...', 'Admin User', 'admin', NULL);

-- PNP Officer
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('pnp@test.com', '$2a$10$...', 'PNP Officer', 'pnp', NULL);

-- BFP Officer
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('bfp@test.com', '$2a$10$...', 'BFP Officer', 'bfp', NULL);

-- MDRRMO Officer
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('mdrrmo@test.com', '$2a$10$...', 'MDRRMO Officer', 'mdrrmo', NULL);

-- LGU Officer
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('lgu@test.com', '$2a$10$...', 'LGU Officer', 'lgu_officer', 'Manila');

-- Citizen
INSERT INTO users (email, password, name, role, jurisdiction) 
VALUES ('citizen@test.com', '$2a$10$...', 'Test Citizen', 'citizen', NULL);
```

## Manual Test Cases

### Test 1: Authentication

**Objective:** Verify JWT tokens include role and jurisdiction

**Steps:**
1. Login as each role
2. Decode the JWT token
3. Verify role and jurisdiction are present

**Expected Results:**
- ✅ Token contains `role` field
- ✅ Token contains `jurisdiction` field (or null)
- ✅ Token contains `jti` for logout tracking
- ✅ Token expiration matches role (4h/8h/24h)

**Test Command:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@test.com","password":"Test@123"}'

# Decode token at jwt.io
```

---

### Test 2: Super Admin Universal Access

**Objective:** Verify super_admin can access all resources

**Steps:**
1. Login as super_admin
2. Try accessing various endpoints (users, alerts, incidents, etc.)
3. Verify all requests succeed

**Expected Results:**
- ✅ GET /api/users → 200 OK
- ✅ GET /api/alerts → 200 OK
- ✅ GET /api/incidents → 200 OK
- ✅ GET /api/sos-alerts → 200 OK
- ✅ GET /api/evacuation-centers → 200 OK
- ✅ POST /api/alerts → 201 Created
- ✅ DELETE /api/users/:id → 200 OK

**Test Command:**
```bash
TOKEN="<super_admin_token>"

curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/alerts
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/incidents
```

---

### Test 3: Admin Permissions

**Objective:** Verify admin can manage most resources but not super_admin accounts

**Steps:**
1. Login as admin
2. Try accessing various endpoints
3. Try modifying a super_admin account (should fail)

**Expected Results:**
- ✅ GET /api/users → 200 OK
- ✅ POST /api/alerts → 201 Created
- ✅ PUT /api/users/:citizen_id → 200 OK
- ❌ PUT /api/users/:super_admin_id → 403 Forbidden
- ❌ DELETE /api/users/:super_admin_id → 403 Forbidden

**Test Command:**
```bash
TOKEN="<admin_token>"

# Should succeed
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users

# Should fail (trying to modify super_admin)
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"citizen"}' \
  http://localhost:3000/api/users/<super_admin_id>
```

---

### Test 4: PNP Permissions

**Objective:** Verify PNP can view incidents and SOS alerts but not create alerts

**Steps:**
1. Login as PNP
2. Try viewing incidents and SOS alerts (should succeed)
3. Try creating an alert (should fail)

**Expected Results:**
- ✅ GET /api/incidents → 200 OK
- ✅ GET /api/sos-alerts → 200 OK
- ✅ GET /api/evacuation-centers → 200 OK
- ❌ POST /api/alerts → 403 Forbidden
- ❌ DELETE /api/alerts/:id → 403 Forbidden

**Test Command:**
```bash
TOKEN="<pnp_token>"

# Should succeed
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/incidents
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/sos-alerts

# Should fail
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Alert","severity":"high"}' \
  http://localhost:3000/api/alerts
```

---

### Test 5: BFP Fire Incident Filtering

**Objective:** Verify BFP sees full details for fire incidents only

**Steps:**
1. Create fire and non-fire incidents
2. Login as BFP
3. Query incidents
4. Verify fire incidents have full details, others have basic info

**Expected Results:**
- ✅ Fire incidents return full details
- ✅ Non-fire incidents return basic info only (id, location, status)

**Test Command:**
```bash
TOKEN="<bfp_token>"

curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/incidents
```

---

### Test 6: MDRRMO Permissions

**Objective:** Verify MDRRMO can create alerts without approval

**Steps:**
1. Login as MDRRMO
2. Create an alert
3. Verify alert is immediately active (not pending)

**Expected Results:**
- ✅ POST /api/alerts → 201 Created
- ✅ Alert status is 'active' (not 'pending_approval')
- ✅ Alert is visible to citizens immediately

**Test Command:**
```bash
TOKEN="<mdrrmo_token>"

curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Typhoon Warning",
    "message":"Typhoon approaching",
    "severity":"high",
    "alert_type":"weather"
  }' \
  http://localhost:3000/api/alerts
```

---

### Test 7: LGU Officer Alert Approval Workflow

**Objective:** Verify LGU officer alerts require approval

**Steps:**
1. Login as LGU officer
2. Create an alert
3. Verify alert status is 'pending_approval'
4. Login as MDRRMO/admin
5. Approve the alert
6. Verify alert is now visible to citizens

**Expected Results:**
- ✅ POST /api/alerts → 201 Created
- ✅ Alert status is 'pending_approval'
- ❌ Citizens cannot see the alert yet
- ✅ MDRRMO can approve: PATCH /api/alerts/:id/approve
- ✅ After approval, citizens can see the alert

**Test Command:**
```bash
# Create alert as LGU officer
TOKEN_LGU="<lgu_token>"
curl -X POST -H "Authorization: Bearer $TOKEN_LGU" \
  -H "Content-Type: application/json" \
  -d '{"title":"Local Alert","message":"Test","severity":"medium"}' \
  http://localhost:3000/api/alerts

# Approve as MDRRMO
TOKEN_MDRRMO="<mdrrmo_token>"
curl -X PATCH -H "Authorization: Bearer $TOKEN_MDRRMO" \
  http://localhost:3000/api/alerts/<alert_id>/approve
```

---

### Test 8: LGU Officer Jurisdiction Filtering

**Objective:** Verify LGU officer only sees data in their jurisdiction

**Steps:**
1. Create incidents in different jurisdictions
2. Login as LGU officer with jurisdiction 'Manila'
3. Query incidents
4. Verify only Manila incidents are returned

**Expected Results:**
- ✅ Only incidents with jurisdiction='Manila' are returned
- ❌ Incidents from other jurisdictions are filtered out

**Test Command:**
```bash
TOKEN="<lgu_token>"

curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/incidents
# Should only return Manila incidents
```

---

### Test 9: Citizen Permissions

**Objective:** Verify citizens can only access public data and create SOS/incidents

**Steps:**
1. Login as citizen
2. Try viewing public alerts (should succeed)
3. Try viewing all users (should fail)
4. Try creating SOS alert (should succeed)
5. Try creating incident (should succeed)

**Expected Results:**
- ✅ GET /api/alerts → 200 OK (public alerts only)
- ✅ POST /api/sos-alerts → 201 Created
- ✅ POST /api/incidents → 201 Created
- ❌ GET /api/users → 403 Forbidden
- ❌ POST /api/alerts → 403 Forbidden
- ❌ DELETE /api/incidents/:id → 403 Forbidden

**Test Command:**
```bash
TOKEN="<citizen_token>"

# Should succeed
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/alerts
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location":"Test Location","description":"Emergency"}' \
  http://localhost:3000/api/sos-alerts

# Should fail
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users
```

---

### Test 10: Role Immutability

**Objective:** Verify users cannot modify their own role

**Steps:**
1. Login as admin
2. Try to change own role to super_admin (should fail)
3. Login as super_admin
4. Try to change own role (should succeed)

**Expected Results:**
- ❌ Admin changing own role → 403 Forbidden
- ✅ Super admin changing own role → 200 OK

**Test Command:**
```bash
TOKEN_ADMIN="<admin_token>"

# Should fail
curl -X PUT -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"role":"super_admin"}' \
  http://localhost:3000/api/users/<admin_id>
```

---

### Test 11: Token Blacklist (Logout)

**Objective:** Verify logged out tokens are invalidated

**Steps:**
1. Login as any user
2. Make a successful request with token
3. Logout
4. Try making request with same token (should fail)

**Expected Results:**
- ✅ Before logout: requests succeed
- ✅ Logout: POST /api/auth/logout → 200 OK
- ❌ After logout: requests return 401 Unauthorized

**Test Command:**
```bash
TOKEN="<user_token>"

# Should succeed
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/profile

# Logout
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/logout

# Should fail
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/profile
```

---

### Test 12: Rate Limiting

**Objective:** Verify different roles have different rate limits

**Steps:**
1. Login as citizen (100 req/hour limit)
2. Make 101 requests rapidly
3. Verify 101st request returns 429
4. Login as super_admin (1000 req/hour limit)
5. Make 101 requests
6. Verify all succeed

**Expected Results:**
- ✅ Citizen: 101st request → 429 Too Many Requests
- ✅ Super admin: All 101 requests → 200 OK
- ✅ Response includes X-RateLimit-* headers

**Test Command:**
```bash
# Use test-role-rate-limiter.js script
node test-role-rate-limiter.js
```

---

### Test 13: Emergency Location Access (PNP)

**Objective:** Verify PNP can only access citizen locations during active emergencies

**Steps:**
1. Login as PNP
2. Try accessing citizen locations (no active emergency) → should fail
3. Create active emergency
4. Try accessing citizen locations → should succeed
5. Close emergency
6. Try accessing citizen locations → should fail again

**Expected Results:**
- ❌ No active emergency: GET /api/users/locations → 403 Forbidden
- ✅ Active emergency: GET /api/users/locations → 200 OK
- ❌ Emergency closed: GET /api/users/locations → 403 Forbidden

**Test Command:**
```bash
TOKEN_PNP="<pnp_token>"

# Should fail (no active emergency)
curl -H "Authorization: Bearer $TOKEN_PNP" \
  http://localhost:3000/api/users/locations
```

---

### Test 14: Audit Logging

**Objective:** Verify all sensitive operations are logged

**Steps:**
1. Perform various operations (login, failed auth, permission denied, etc.)
2. Query audit_logs table
3. Verify all operations are logged with correct details

**Expected Results:**
- ✅ Login attempts logged
- ✅ Failed authentication logged
- ✅ Authorization failures logged (403)
- ✅ Successful operations logged
- ✅ Logs include user_id, role, action, resource, status, timestamp

**Test Command:**
```sql
-- Check recent audit logs
SELECT 
  id,
  user_id,
  role,
  action,
  resource,
  status,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 50;

-- Check failed authorization attempts
SELECT * FROM audit_logs
WHERE status = 'denied'
ORDER BY created_at DESC
LIMIT 20;

-- Check specific user's activity
SELECT * FROM audit_logs
WHERE user_id = <user_id>
ORDER BY created_at DESC;
```

---

## Verification Checklist

After completing all manual tests, verify:

- [ ] All 7 roles are working correctly
- [ ] Super admin has universal access
- [ ] Admin cannot modify super_admin accounts
- [ ] PNP/BFP/MDRRMO have system-wide access (no geographic filtering)
- [ ] LGU officers are filtered by jurisdiction
- [ ] Citizens can only access public data
- [ ] Alert approval workflow works for LGU officers
- [ ] Fire incident filtering works for BFP
- [ ] Role immutability is enforced
- [ ] Token blacklist works (logout invalidates tokens)
- [ ] Rate limiting varies by role
- [ ] Emergency location access works for PNP
- [ ] All operations are logged to audit_logs
- [ ] No unauthorized access is possible

## Next Steps

Once all manual tests pass:

1. ✅ Mark Task 9 as complete
2. Review audit logs for any anomalies
3. Proceed to Task 10 (Frontend role provider)
4. Document any issues found during testing

## Troubleshooting

**Issue:** Token verification fails
- Check JWT_SECRET in .env
- Verify token hasn't expired
- Check token isn't blacklisted

**Issue:** Permission denied unexpectedly
- Check role_permissions table has correct entries
- Verify user's role in database
- Check audit_logs for details

**Issue:** Rate limiting not working
- Verify roleBasedRateLimiter middleware is applied
- Check request store is being updated
- Verify role is correctly extracted from token

**Issue:** Audit logs not created
- Check auditLogger service is imported
- Verify database connection
- Check audit_logs table exists
