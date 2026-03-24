# RBAC System Testing Guide

## Overview
This guide provides comprehensive instructions for testing the Enhanced RBAC System with all 7 roles across both web and mobile applications.

## Test Users Setup

### Quick Setup

Run the PowerShell script to create all test users:

```powershell
cd MOBILE_APP/database
./create-test-users.ps1
```

Or run the Node.js script directly:

```bash
cd MOBILE_APP/database
node generate-test-users.js
```

### Test User Credentials

**Password for all users:** `Test123!`

| Role | Email | Jurisdiction | Access Level |
|------|-------|--------------|--------------|
| Super Admin | superadmin@test.safehaven.com | None | Full system access |
| Admin | admin@test.safehaven.com | None | Manage all except super_admin |
| MDRRMO | mdrrmo@test.safehaven.com | None | Disaster coordination |
| PNP | pnp@test.safehaven.com | None | Law enforcement |
| BFP | bfp@test.safehaven.com | None | Fire protection |
| LGU Officer | lgu@test.safehaven.com | Manila | Local government (Manila only) |
| Citizen | citizen@test.safehaven.com | None | Public user |

## Testing Checklist by Role

### 1. Super Admin Testing

**Login:** superadmin@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view all menu items:
  - [ ] Dashboard
  - [ ] Emergency Alerts
  - [ ] Incidents
  - [ ] Evacuation Centers
  - [ ] Users
  - [ ] SOS Alerts
  - [ ] Emergency Contacts
  - [ ] Analytics
  - [ ] Monitoring
  - [ ] Alert Automation
  - [ ] Permissions (super_admin only)
  - [ ] Audit Logs

#### Permissions Page Tests
- [ ] Can view all role permissions
- [ ] Can add new permissions
- [ ] Can remove permissions (except super_admin)
- [ ] Cannot modify super_admin permissions
- [ ] Permission changes take effect immediately

#### Audit Logs Tests
- [ ] Can view all audit logs
- [ ] Can filter by user, role, action, status
- [ ] Can filter by date range
- [ ] Pagination works correctly
- [ ] Failed attempts are highlighted in red
- [ ] Statistics display correctly

#### User Management Tests
- [ ] Can view all users
- [ ] Can create users with any role
- [ ] Can update any user (including admins)
- [ ] Can delete any user
- [ ] Can modify roles for any user

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can access all features
- [ ] Can create SOS alerts
- [ ] Can view all incidents
- [ ] Can view evacuation centers

---

### 2. Admin Testing

**Login:** admin@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view menu items (except Permissions):
  - [ ] Dashboard
  - [ ] Emergency Alerts
  - [ ] Incidents
  - [ ] Evacuation Centers
  - [ ] Users
  - [ ] SOS Alerts
  - [ ] Emergency Contacts
  - [ ] Analytics
  - [ ] Monitoring
  - [ ] Alert Automation
  - [ ] Audit Logs

#### Permissions Page Tests
- [ ] Cannot access Permissions page (should not see menu item)
- [ ] Direct URL access should be blocked

#### Audit Logs Tests
- [ ] Can view all audit logs
- [ ] Can filter logs
- [ ] Can see statistics

#### User Management Tests
- [ ] Can view all users except super_admins
- [ ] Can create users (except super_admin role)
- [ ] Can update users (except super_admins)
- [ ] Can delete users (except super_admins)
- [ ] Cannot modify super_admin accounts

#### Alert Management Tests
- [ ] Can create alerts without approval
- [ ] Can update any alert
- [ ] Can delete any alert
- [ ] Can approve LGU officer alerts

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can access admin features
- [ ] Can manage incidents
- [ ] Can view all SOS alerts

---

### 3. MDRRMO Testing

**Login:** mdrrmo@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view menu items:
  - [ ] Dashboard
  - [ ] Emergency Alerts
  - [ ] Incidents
  - [ ] Evacuation Centers
  - [ ] SOS Alerts
  - [ ] Emergency Contacts
  - [ ] Analytics
  - [ ] Monitoring
  - [ ] Alert Automation

#### Cannot Access
- [ ] Users page (should not see menu item)
- [ ] Permissions page
- [ ] Audit Logs page

#### Alert Management Tests
- [ ] Can create alerts without approval
- [ ] Can update any alert
- [ ] Can delete any alert
- [ ] Can approve LGU officer alerts
- [ ] Alerts are immediately visible to citizens

#### Incident Management Tests
- [ ] Can view all incidents (system-wide)
- [ ] Can update incident status
- [ ] Can assign incidents to agencies
- [ ] No geographic filtering

#### SOS Alerts Tests
- [ ] Can view all SOS alerts (system-wide)
- [ ] Can respond to SOS alerts
- [ ] No geographic filtering

#### Evacuation Centers Tests
- [ ] Can create evacuation centers
- [ ] Can update any evacuation center
- [ ] Can delete evacuation centers
- [ ] Can view all centers (system-wide)

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can coordinate disaster response
- [ ] Can view all incidents and SOS alerts
- [ ] Can manage evacuation centers

---

### 4. PNP Testing

**Login:** pnp@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view menu items:
  - [ ] Dashboard
  - [ ] Incidents
  - [ ] SOS Alerts

#### Cannot Access
- [ ] Emergency Alerts (cannot create/manage)
- [ ] Evacuation Centers (read-only if visible)
- [ ] Users
- [ ] Emergency Contacts
- [ ] Analytics
- [ ] Monitoring
- [ ] Alert Automation
- [ ] Permissions
- [ ] Audit Logs

#### Incident Management Tests
- [ ] Can view all incidents (system-wide)
- [ ] Can update incident status
- [ ] Can create incident reports
- [ ] Cannot create new incidents
- [ ] Cannot delete incidents

#### SOS Alerts Tests
- [ ] Can view all SOS alerts (system-wide)
- [ ] Can respond to SOS alerts
- [ ] No geographic filtering

#### Emergency Location Access Tests
- [ ] Can access citizen location during active emergencies
- [ ] Cannot access location when no active emergency

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can view and respond to incidents
- [ ] Can view SOS alerts
- [ ] Can update incident status

---

### 5. BFP Testing

**Login:** bfp@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view menu items:
  - [ ] Dashboard
  - [ ] Incidents
  - [ ] SOS Alerts

#### Cannot Access
- [ ] Emergency Alerts
- [ ] Evacuation Centers (read-only if visible)
- [ ] Users
- [ ] Emergency Contacts
- [ ] Analytics
- [ ] Monitoring
- [ ] Alert Automation
- [ ] Permissions
- [ ] Audit Logs

#### Incident Management Tests
- [ ] Can view fire incidents with full details
- [ ] Can view non-fire incidents with basic info only
- [ ] Can update fire incident status
- [ ] Cannot update non-fire incidents
- [ ] Cannot create or delete incidents

#### Fire Station Management Tests
- [ ] Can create fire station locations
- [ ] Can update fire station data
- [ ] Can delete fire stations
- [ ] Can view all fire stations

#### SOS Alerts Tests
- [ ] Can view all SOS alerts (system-wide)
- [ ] Can respond to fire-related SOS alerts

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can view fire incidents
- [ ] Can respond to fire emergencies
- [ ] Can manage fire station data

---

### 6. LGU Officer Testing

**Login:** lgu@test.safehaven.com / Test123!

**Jurisdiction:** Manila

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Can view menu items:
  - [ ] Dashboard
  - [ ] Emergency Alerts
  - [ ] Incidents
  - [ ] Evacuation Centers
  - [ ] SOS Alerts

#### Cannot Access
- [ ] Users
- [ ] Emergency Contacts
- [ ] Analytics
- [ ] Monitoring
- [ ] Alert Automation
- [ ] Permissions
- [ ] Audit Logs

#### Alert Management Tests
- [ ] Can create alerts (status: pending_approval)
- [ ] Created alerts are NOT visible to citizens until approved
- [ ] Cannot update or delete alerts after creation
- [ ] Alerts require MDRRMO/Admin approval

#### Incident Management Tests
- [ ] Can view incidents in Manila jurisdiction ONLY
- [ ] Can update incident status (Manila only)
- [ ] Cannot view incidents outside Manila
- [ ] Can create incident reports

#### SOS Alerts Tests
- [ ] Can view SOS alerts in Manila jurisdiction ONLY
- [ ] Cannot view SOS alerts outside Manila
- [ ] Geographic filtering is enforced

#### Evacuation Centers Tests
- [ ] Can create evacuation centers in Manila
- [ ] Can update centers in Manila jurisdiction
- [ ] Can delete centers in Manila jurisdiction
- [ ] Cannot access centers outside Manila

#### Geographic Filtering Tests
- [ ] All data queries are filtered by jurisdiction
- [ ] Cannot access data outside Manila
- [ ] Jurisdiction is enforced at database level

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can manage local disaster response
- [ ] Can only see Manila data
- [ ] Can create alerts (pending approval)

---

### 7. Citizen Testing

**Login:** citizen@test.safehaven.com / Test123!

#### Web Application Tests
- [ ] Login successful
- [ ] Dashboard accessible (if citizen dashboard exists)
- [ ] Limited menu items visible

#### Cannot Access
- [ ] Emergency Alerts management
- [ ] Incidents management
- [ ] Evacuation Centers management
- [ ] Users
- [ ] SOS Alerts management
- [ ] Emergency Contacts
- [ ] Analytics
- [ ] Monitoring
- [ ] Alert Automation
- [ ] Permissions
- [ ] Audit Logs

#### Alert Viewing Tests
- [ ] Can view published public alerts only
- [ ] Cannot see pending approval alerts
- [ ] Cannot see private alerts from other users
- [ ] Can see own created alerts

#### Incident Reporting Tests
- [ ] Can create incident reports
- [ ] Can view own incident reports
- [ ] Cannot update or delete incidents
- [ ] Cannot view other users' private incidents

#### SOS Alerts Tests
- [ ] Can create SOS alerts for personal emergencies
- [ ] Can view own SOS alerts
- [ ] Cannot view other users' SOS alerts

#### Evacuation Centers Tests
- [ ] Can view evacuation center locations
- [ ] Can view capacity information
- [ ] Cannot create, update, or delete centers

#### Profile Management Tests
- [ ] Can update own profile
- [ ] Can manage family group memberships
- [ ] Cannot change own role
- [ ] Cannot access other users' data

#### Mobile Application Tests
- [ ] Login successful
- [ ] Can view public alerts
- [ ] Can create SOS alerts
- [ ] Can report incidents
- [ ] Can view evacuation centers
- [ ] Can manage profile and family groups

---

## Cross-Role Testing Scenarios

### Scenario 1: Alert Approval Workflow
1. Login as LGU Officer
2. Create an alert
3. Verify alert status is "pending_approval"
4. Logout
5. Login as Citizen
6. Verify alert is NOT visible
7. Logout
8. Login as MDRRMO or Admin
9. Approve the alert
10. Logout
11. Login as Citizen
12. Verify alert is NOW visible

### Scenario 2: Jurisdiction Filtering
1. Create test data in different jurisdictions (Manila, Quezon City, etc.)
2. Login as LGU Officer (Manila)
3. Verify only Manila data is visible
4. Try to access Quezon City data (should fail)
5. Logout
6. Login as MDRRMO
7. Verify all data is visible (no filtering)

### Scenario 3: Role Hierarchy
1. Login as Admin
2. Try to modify a Super Admin account (should fail)
3. Try to create a Super Admin account (should fail)
4. Verify can modify other roles
5. Logout
6. Login as Super Admin
7. Verify can modify any account including Admins

### Scenario 4: Permission Changes
1. Login as Super Admin
2. Go to Permissions page
3. Remove a permission from Admin role
4. Logout
5. Login as Admin
6. Verify the removed permission is immediately enforced
7. Logout
8. Login as Super Admin
9. Restore the permission
10. Verify it takes effect immediately

### Scenario 5: Audit Logging
1. Login as any role
2. Perform various actions (create, update, delete)
3. Logout
4. Login as Super Admin or Admin
5. Go to Audit Logs page
6. Verify all actions are logged
7. Filter by user, role, action
8. Verify failed attempts are highlighted

### Scenario 6: Emergency Location Access (PNP)
1. Create an active emergency incident
2. Login as PNP
3. Verify can access citizen location data
4. Mark incident as resolved
5. Verify location access is denied
6. Verify audit log shows access attempts

### Scenario 7: Fire Incident Filtering (BFP)
1. Create fire and non-fire incidents
2. Login as BFP
3. View incidents list
4. Verify fire incidents show full details
5. Verify non-fire incidents show basic info only
6. Try to update non-fire incident (should fail)

---

## API Testing with Postman/cURL

### Get JWT Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@test.safehaven.com",
    "password": "Test123!"
  }'
```

### Test Audit Logs Endpoint
```bash
curl -X GET "http://localhost:3001/api/admin/audit-logs?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Permissions Endpoint
```bash
curl -X GET "http://localhost:3001/api/admin/permissions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Role-Based Access
```bash
# Should succeed for super_admin
curl -X GET "http://localhost:3001/api/admin/permissions" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Should fail (403) for admin
curl -X GET "http://localhost:3001/api/admin/permissions" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Security Testing

### Test 1: Unauthorized Access
- [ ] Try accessing protected pages without login (should redirect)
- [ ] Try accessing API endpoints without token (should return 401)
- [ ] Try accessing with expired token (should return 401)

### Test 2: Privilege Escalation
- [ ] Try to modify JWT token payload (should fail signature verification)
- [ ] Try to access higher privilege resources (should return 403)
- [ ] Try to change own role via API (should fail)

### Test 3: SQL Injection
- [ ] Try SQL injection in filter inputs
- [ ] Verify parameterized queries prevent injection
- [ ] Check audit logs for injection attempts

### Test 4: Rate Limiting
- [ ] Make rapid requests with each role
- [ ] Verify rate limits are enforced per role
- [ ] Verify 429 status code when limit exceeded

---

## Performance Testing

### Load Testing
- [ ] Test with 100+ concurrent users
- [ ] Test audit log queries with 10,000+ records
- [ ] Test permission checks under load
- [ ] Verify caching improves performance

### Database Performance
- [ ] Verify indexes are used in queries
- [ ] Check query execution times
- [ ] Test pagination with large datasets

---

## Troubleshooting

### Issue: Cannot login with test users
**Solution:** 
1. Verify users were created: `SELECT * FROM users WHERE email LIKE '%@test.safehaven.com'`
2. Check password hash is correct
3. Verify backend is running
4. Check database connection

### Issue: Role permissions not working
**Solution:**
1. Verify role_permissions table is seeded
2. Check permission cache is working
3. Verify middleware is applied to routes
4. Check audit logs for denied attempts

### Issue: Jurisdiction filtering not working
**Solution:**
1. Verify user has jurisdiction set
2. Check DataFilterService is applied
3. Verify WHERE clauses in queries
4. Test with different jurisdictions

### Issue: Audit logs not appearing
**Solution:**
1. Check audit_logs table exists
2. Verify auditLogger service is called
3. Check for async logging errors
4. Verify database write permissions

---

## Test Results Template

Use this template to document your testing results:

```markdown
## Test Session: [Date]

### Tester: [Name]
### Environment: [Web/Mobile/Both]

### Super Admin Tests
- [ ] Login: PASS/FAIL
- [ ] Permissions: PASS/FAIL
- [ ] Audit Logs: PASS/FAIL
- [ ] User Management: PASS/FAIL
- Notes: 

### Admin Tests
- [ ] Login: PASS/FAIL
- [ ] Limited Access: PASS/FAIL
- [ ] User Management: PASS/FAIL
- Notes:

[Continue for all roles...]

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## Next Steps After Testing

1. Document all issues found
2. Prioritize fixes based on severity
3. Update permissions if needed
4. Adjust role capabilities based on feedback
5. Create user documentation
6. Train end users on role-specific features

---

## Support

For issues or questions:
- Check audit logs for error details
- Review backend logs
- Check database for data integrity
- Verify environment variables are set correctly

---

**Last Updated:** March 2, 2026
**Version:** 1.0
