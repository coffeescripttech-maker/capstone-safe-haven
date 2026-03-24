# Test Users Quick Reference

## 🔐 Universal Password
**All test users:** `Test123!`

---

## 👥 Test User Accounts

### 1️⃣ Super Admin
- **Email:** `superadmin@test.safehaven.com`
- **Role:** `super_admin`
- **Access:** Full system access, all features
- **Special:** Can manage permissions, view audit logs

### 2️⃣ Admin
- **Email:** `admin@test.safehaven.com`
- **Role:** `admin`
- **Access:** Manage all except super_admin accounts
- **Special:** Can view audit logs, approve alerts

### 3️⃣ MDRRMO Officer
- **Email:** `mdrrmo@test.safehaven.com`
- **Role:** `mdrrmo`
- **Access:** Disaster coordination, system-wide data
- **Special:** Create alerts without approval, manage all incidents

### 4️⃣ PNP Officer
- **Email:** `pnp@test.safehaven.com`
- **Role:** `pnp`
- **Access:** View/respond to incidents and SOS alerts
- **Special:** Emergency location access during active incidents

### 5️⃣ BFP Officer
- **Email:** `bfp@test.safehaven.com`
- **Role:** `bfp`
- **Access:** Fire incidents and SOS alerts
- **Special:** Full details for fire incidents only

### 6️⃣ LGU Officer
- **Email:** `lgu@test.safehaven.com`
- **Role:** `lgu_officer`
- **Jurisdiction:** `Manila`
- **Access:** Local disaster response (Manila only)
- **Special:** Alerts require approval, geographic filtering

### 7️⃣ Citizen
- **Email:** `citizen@test.safehaven.com`
- **Role:** `citizen`
- **Access:** Public alerts, create SOS, report incidents
- **Special:** Limited to public data and own content

---

## 🚀 Quick Setup

```powershell
cd MOBILE_APP/database
./create-test-users.ps1
```

Or:

```bash
cd MOBILE_APP/database
node generate-test-users.js
```

---

## 📱 Testing URLs

### Web Application
- **Local:** http://localhost:3000
- **Login:** http://localhost:3000/auth/login

### Mobile Application
- **Expo:** Use Expo Go app
- **Android:** Install APK
- **iOS:** Use TestFlight or development build

### Backend API
- **Local:** http://localhost:3001
- **Health:** http://localhost:3001/health

---

## 🧪 Quick Test Commands

### Login Test (cURL)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.safehaven.com","password":"Test123!"}'
```

### Check User Roles (MySQL)
```sql
SELECT id, email, role, jurisdiction 
FROM users 
WHERE email LIKE '%@test.safehaven.com'
ORDER BY FIELD(role, 'super_admin', 'admin', 'mdrrmo', 'pnp', 'bfp', 'lgu_officer', 'citizen');
```

### View Audit Logs (MySQL)
```sql
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## 📊 Role Comparison Matrix

| Feature | Super Admin | Admin | MDRRMO | PNP | BFP | LGU | Citizen |
|---------|-------------|-------|--------|-----|-----|-----|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Alerts | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡* | ❌ |
| View Incidents | ✅ | ✅ | ✅ | ✅ | 🟡** | 🟡*** | ❌ |
| Manage Users | ✅ | 🟡**** | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Permissions | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SOS Alerts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Evacuation Centers | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡*** | ✅ |
| Analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full access
- 🟡 Limited access
- ❌ No access

**Notes:**
- \* LGU: Alerts require approval
- \*\* BFP: Fire incidents only (full details)
- \*\*\* LGU: Jurisdiction-filtered (Manila only)
- \*\*\*\* Admin: Cannot manage super_admin accounts

---

## 🔍 Common Test Scenarios

### 1. Login Test
1. Open web/mobile app
2. Enter email and password
3. Verify successful login
4. Check role-specific dashboard

### 2. Permission Test
1. Login with specific role
2. Try to access restricted feature
3. Verify 403 error or hidden UI
4. Check audit log entry

### 3. Jurisdiction Test
1. Login as LGU Officer
2. View incidents/alerts
3. Verify only Manila data visible
4. Try to access other jurisdiction (should fail)

### 4. Approval Workflow Test
1. Login as LGU Officer
2. Create alert
3. Verify status: pending
4. Login as MDRRMO
5. Approve alert
6. Login as Citizen
7. Verify alert is visible

---

## 📞 Support

**Documentation:** See `RBAC_TESTING_GUIDE.md` for detailed testing instructions

**Issues:** Check audit logs and backend logs for error details

**Database:** Verify schema with `verify-rbac-schema.ps1`

---

**Created:** March 2, 2026
**Password:** Test123! (for all test users)
