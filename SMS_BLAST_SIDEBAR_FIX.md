# SMS Blast Sidebar Not Showing - Fix Guide

## Problem

You don't see "SMS Blast" in the sidebar menu of the web app.

## Why This Happens

The SMS Blast menu item is **role-protected**. It only shows for users with these roles:
- `super_admin` - Full access to all locations
- `admin` - Limited to specific jurisdiction

If your user account has a different role (like `user`, `citizen`, `lgu_officer`), the menu won't appear.

---

## Solution: Update Your User Role

### Option 1: Use the Fix Script (Easiest)

1. Open PowerShell in the backend folder:
```powershell
cd MOBILE_APP/backend
```

2. Run the fix script:
```powershell
.\fix-sms-blast-access.ps1
```

3. Follow the prompts:
   - Enter your email address
   - Choose role (1 for super_admin, 2 for admin)
   - Script will update your role

4. **Logout and login again** in the web app

5. SMS Blast should now appear in the sidebar!

### Option 2: Manual Database Update

If you prefer to update manually:

```powershell
# Connect to MySQL
mysql -u root -proot -D safehaven_db

# Update your user role (replace with your email)
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';

# Verify the change
SELECT id, username, email, role FROM users WHERE email = 'your-email@example.com';

# Exit MySQL
exit;
```

### Option 3: Create a New Superadmin User

If you want a fresh superadmin account:

```powershell
cd MOBILE_APP/backend
.\check-user-role-for-sms.ps1
```

This will:
- Check existing users with SMS access
- Offer to create a new superadmin user if none exist
- Credentials: `superadmin@safehaven.ph` / `Admin123!`

---

## Verification Steps

### Step 1: Check Your Role in Database

```powershell
mysql -u root -proot -D safehaven_db -e "SELECT id, username, email, role FROM users WHERE email = 'your-email@example.com';"
```

**Expected Output:**
```
+----+----------+------------------------+-------------+
| id | username | email                  | role        |
+----+----------+------------------------+-------------+
|  1 | admin    | your-email@example.com | super_admin |
+----+----------+------------------------+-------------+
```

### Step 2: Logout and Login

1. Go to web app: `http://localhost:3000`
2. Click your profile icon → Logout
3. Login again with your credentials
4. The sidebar should now show "SMS Blast"

### Step 3: Verify SMS Blast Appears

Look for this in the sidebar:

```
Menu
├─ Dashboard
├─ Emergency Alerts
├─ Incidents
├─ Evacuation Centers
├─ Users
├─ SOS Alerts
├─ Emergency Contacts
├─ Analytics
├─ Monitoring
├─ Alert Automation
├─ SMS Blast          ← Should appear here!
├─ Permissions
└─ Audit Logs
```

---

## Troubleshooting

### Issue 1: Script Says "MySQL Not Found"

**Solution:** Install MySQL command-line client or use MySQL Workbench

**Alternative:** Update role directly in MySQL Workbench:
1. Open MySQL Workbench
2. Connect to `safehaven_db`
3. Run query:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

### Issue 2: Still Not Showing After Role Update

**Possible Causes:**

1. **Browser cache** - Clear cache and hard refresh (Ctrl + Shift + R)

2. **Session not refreshed** - Make sure you logged out and logged back in

3. **Wrong role name** - Check the role is exactly `super_admin` or `admin` (not `superadmin` or `Super_Admin`)

4. **RBAC migration not applied** - Run the RBAC migration:
```powershell
cd MOBILE_APP/database
.\apply-rbac-migrations.ps1
```

### Issue 3: "Access Denied" Error When Clicking SMS Blast

**Solution:** Your backend might not recognize the role. Check:

1. Backend is running:
```powershell
cd MOBILE_APP/backend
npm run dev
```

2. Backend logs show no errors:
```powershell
cat MOBILE_APP/backend/logs/combined.log
```

3. JWT token is valid - logout and login again

### Issue 4: Menu Shows But Returns 403 Error

**Solution:** The frontend shows the menu, but backend denies access.

Check backend middleware:
```powershell
# Test API access
curl -X GET http://localhost:3001/api/sms-blast/templates `
  -H "Authorization: Bearer YOUR_TOKEN"
```

If you get 403, your token might have old role information. Logout and login again.

---

## Understanding Role-Based Access

### Role Hierarchy

```
super_admin (Highest)
    ↓
  admin
    ↓
  mdrrmo
    ↓
lgu_officer
    ↓
   pnp
    ↓
   bfp
    ↓
 citizen (Lowest)
```

### SMS Blast Access Matrix

| Role         | Can Access SMS Blast? | Can Send To          |
|--------------|----------------------|----------------------|
| super_admin  | ✅ Yes               | All locations        |
| admin        | ✅ Yes               | Assigned jurisdiction|
| mdrrmo       | ❌ No                | N/A                  |
| lgu_officer  | ❌ No                | N/A                  |
| pnp          | ❌ No                | N/A                  |
| bfp          | ❌ No                | N/A                  |
| citizen      | ❌ No                | N/A                  |

### Jurisdiction for Admin Role

If you're an `admin`, you can only send SMS to users in your assigned jurisdiction:

```sql
-- Set jurisdiction for admin user
UPDATE users 
SET province = 'Metro Manila', 
    city = 'Manila' 
WHERE email = 'admin@example.com';
```

Then the admin can only send SMS to users in Metro Manila.

---

## Quick Fix Commands

### Make User Superadmin
```powershell
mysql -u root -proot -D safehaven_db -e "UPDATE users SET role='super_admin' WHERE email='your-email@example.com';"
```

### Make User Admin with Jurisdiction
```powershell
mysql -u root -proot -D safehaven_db -e "UPDATE users SET role='admin', province='Metro Manila', city='Manila' WHERE email='your-email@example.com';"
```

### Check All Users with SMS Access
```powershell
mysql -u root -proot -D safehaven_db -e "SELECT id, username, email, role, province, city FROM users WHERE role IN ('super_admin', 'admin');"
```

### Create Test Superadmin
```powershell
mysql -u root -proot -D safehaven_db -e "INSERT INTO users (username, email, password, first_name, last_name, role, phone_number, is_verified, is_active) VALUES ('superadmin', 'superadmin@safehaven.ph', '\$2b\$10\$rQZ9vXqZ9vXqZ9vXqZ9vXOqZ9vXqZ9vXqZ9vXqZ9vXqZ9vXqZ9vXq', 'Super', 'Admin', 'super_admin', '+639171234567', TRUE, TRUE) ON DUPLICATE KEY UPDATE role='super_admin';"
```

Login with: `superadmin@safehaven.ph` / `Admin123!`

---

## After Fixing

Once SMS Blast appears in the sidebar:

1. Click **"SMS Blast"** in the sidebar
2. You should see the SMS Blast dashboard
3. Try sending a test SMS following the testing guide: `SMS_BLAST_TESTING_GUIDE.md`

---

## Still Having Issues?

### Check These Files

1. **Sidebar Component:**
   - File: `MOBILE_APP/web_app/src/layout/AppSidebar.tsx`
   - Line 111-115: SMS Blast menu item
   - Required roles: `['super_admin', 'admin']`

2. **Backend Routes:**
   - File: `MOBILE_APP/backend/src/routes/smsBlast.routes.ts`
   - Middleware: `smsAuth.requireSMSBlastAccess`

3. **Backend Middleware:**
   - File: `MOBILE_APP/backend/src/middleware/smsAuth.ts`
   - Function: `requireSMSBlastAccess`

### Enable Debug Mode

Add console logging to see what's happening:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors when the sidebar loads
4. Check Network tab for failed API calls

### Contact Support

If nothing works, provide these details:
- Your user role from database
- Browser console errors
- Backend logs
- Screenshot of sidebar

---

## Summary

**Quick Fix:**
1. Run `.\fix-sms-blast-access.ps1`
2. Enter your email
3. Choose super_admin (option 1)
4. Logout and login in web app
5. SMS Blast should appear!

**Manual Fix:**
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

Then logout and login again.

That's it! 🎉
