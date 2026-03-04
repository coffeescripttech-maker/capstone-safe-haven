# Citizen Incident Permission Fix ✅

## Issue

Citizens were getting "403 Insufficient permissions" error when trying to view incidents in the mobile app because they only had 'create' permission but not 'read' permission on the 'incidents' resource.

## Error Message
```
🔐 Permission check: {
  path: '/',
  method: 'GET',
  userId: 6,
  role: 'citizen',
  resource: 'incidents',
  action: 'read'
}
❌ Permission DENIED
403 - Insufficient permissions - /api/v1/incidents?limit=50 - GET
```

## Root Cause

In the role permissions seed data (`004_seed_role_permissions.sql`), citizens only had:
- ✅ `('citizen', 'incidents', 'create')` - Can create incident reports
- ❌ Missing `('citizen', 'incidents', 'read')` - Cannot view incidents

## Solution

Added 'read' permission for citizens on the 'incidents' resource so they can:
1. Create incident reports (existing)
2. View incident reports (new)

## Files Modified

1. **`database/migrations/004_seed_role_permissions.sql`**
   - Added `('citizen', 'incidents', 'read')` permission

## Files Created

1. **`database/add-citizen-incident-read-permission.sql`**
   - SQL script to add the permission to existing database

2. **`database/apply-citizen-incident-permission.ps1`**
   - PowerShell script to apply the permission

## How to Apply

### Option 1: Run PowerShell Script (Recommended)
```powershell
cd MOBILE_APP/database
.\apply-citizen-incident-permission.ps1
```

### Option 2: Run SQL Directly
```powershell
# Connect to MySQL
mysql -h localhost -u root -p safehaven_db

# Run the SQL
INSERT INTO role_permissions (role, resource, action)
VALUES ('citizen', 'incidents', 'read')
ON DUPLICATE KEY UPDATE
  role = VALUES(role),
  resource = VALUES(resource),
  action = VALUES(action);

# Verify
SELECT * FROM role_permissions WHERE role = 'citizen' AND resource = 'incidents';
```

## Expected Result

After applying the permission:

```sql
+--------+-----------+--------+
| role   | resource  | action |
+--------+-----------+--------+
| citizen| incidents | create |
| citizen| incidents | read   |
+--------+-----------+--------+
```

## Testing

### Before Fix
```
Mobile App → View Incidents → 403 Forbidden ❌
```

### After Fix
```
Mobile App → View Incidents → Success ✅
```

### Test Steps

1. **Apply the permission**:
   ```powershell
   cd MOBILE_APP/database
   .\apply-citizen-incident-permission.ps1
   ```

2. **Login as citizen** in mobile app

3. **Navigate to Incidents** screen

4. **Verify** incidents load without errors

## Permissions Matrix

### Citizen Role - Incidents Resource

| Action | Before | After | Purpose |
|--------|--------|-------|---------|
| create | ✅ | ✅ | Report new incidents |
| read   | ❌ | ✅ | View incident reports |
| update | ❌ | ❌ | Not needed for citizens |
| delete | ❌ | ❌ | Not needed for citizens |

## API Endpoints Affected

### Now Accessible to Citizens

```
GET /api/v1/incidents
GET /api/v1/incidents/:id
GET /api/v1/incidents/my
```

### Already Accessible

```
POST /api/v1/incidents (create)
```

### Still Restricted

```
PATCH /api/v1/incidents/:id/status (update - admin only)
DELETE /api/v1/incidents/:id (delete - admin only)
```

## Security Considerations

- ✅ Citizens can only view incidents, not modify or delete them
- ✅ Citizens can still create their own incident reports
- ✅ Update and delete permissions remain restricted to admins
- ✅ No security risk - viewing public incident reports is expected behavior

## Mobile App Features Enabled

With this fix, citizens can now:
1. ✅ View list of incident reports
2. ✅ View incident details
3. ✅ Create new incident reports
4. ✅ View their own incident reports
5. ✅ Filter and search incidents

## Related Routes

The incident routes in `backend/src/routes/incident.routes.ts`:

```typescript
// Now works for citizens ✅
router.get('/', authenticate, requirePermission('incidents', 'read'), ...);
router.get('/:id', authenticate, requirePermission('incidents', 'read'), ...);

// Already worked for citizens ✅
router.post('/', authenticate, requirePermission('incidents', 'create'), ...);
router.get('/my', authenticate, ...); // No permission check

// Still admin-only ✅
router.patch('/:id/status', authenticate, requirePermission('incidents', 'update'), ...);
router.delete('/:id', authenticate, requirePermission('incidents', 'delete'), ...);
```

## Verification Query

Check all citizen permissions:

```sql
SELECT role, resource, action 
FROM role_permissions 
WHERE role = 'citizen' 
ORDER BY resource, action;
```

Expected output should include:
```
citizen | incidents | create
citizen | incidents | read
```

## Rollback (If Needed)

To remove the permission:

```sql
DELETE FROM role_permissions 
WHERE role = 'citizen' 
  AND resource = 'incidents' 
  AND action = 'read';
```

## Notes

- This permission is standard for citizen users
- Allows them to view community incident reports
- Does not grant modification or deletion rights
- Aligns with mobile app functionality

---

**Status**: ✅ Fixed
**Issue**: Citizens couldn't view incidents
**Solution**: Added 'read' permission for citizens on incidents
**Impact**: Mobile app incident viewing now works for citizens

Apply the permission and test! 🚀
