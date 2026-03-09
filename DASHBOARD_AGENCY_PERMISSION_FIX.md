# Dashboard 403 Permission Fix for Agency Roles

## Problem
BFP, PNP, and MDRRMO users were getting **403 Forbidden** error when accessing the dashboard because they lacked permission to access the `/api/v1/admin/stats` endpoint.

## Root Cause
The `/admin/stats` endpoint requires `analytics` read permission, but agency roles (PNP, BFP, MDRRMO) didn't have this permission in the database.

```typescript
// admin.routes.ts
router.get('/stats', requirePermission('analytics', 'read'), adminController.getStats);
```

## Solution

### 1. Database Migration
Added analytics read permission for agency roles:

**File:** `database/migrations/012_add_analytics_permission_agency_roles.sql`

```sql
-- Add analytics read permission for PNP
INSERT INTO role_permissions (role, resource, action) 
VALUES ('pnp', 'analytics', 'read')
ON DUPLICATE KEY UPDATE action = 'read';

-- Add analytics read permission for BFP
INSERT INTO role_permissions (role, resource, action) 
VALUES ('bfp', 'analytics', 'read')
ON DUPLICATE KEY UPDATE action = 'read';

-- MDRRMO already has analytics read permission
```

### 2. Apply Migration

Run the PowerShell script:

```powershell
cd MOBILE_APP/database
.\apply-agency-analytics-permission.ps1
```

Or manually apply:

```powershell
cd MOBILE_APP/database
mysql -h localhost -u root -p safehaven_db < migrations/012_add_analytics_permission_agency_roles.sql
```

### 3. Recompile Backend

The backend TypeScript needs to be recompiled to apply the incident agency selection changes:

```powershell
cd MOBILE_APP/backend
npm run build
```

### 4. Restart Backend Server

```powershell
cd MOBILE_APP/backend
npm start
```

Or if using nodemon:

```powershell
npm run dev
```

## Verification Steps

### 1. Check Database Permissions

```sql
SELECT role, resource, action 
FROM role_permissions 
WHERE resource = 'analytics' 
ORDER BY role;
```

Expected output:
```
+-------------+-----------+--------+
| role        | resource  | action |
+-------------+-----------+--------+
| admin       | analytics | read   |
| bfp         | analytics | read   |
| mdrrmo      | analytics | read   |
| pnp         | analytics | read   |
| super_admin | analytics | read   |
| super_admin | analytics | execute|
+-------------+-----------+--------+
```

### 2. Test BFP Login

1. Login as BFP user:
   - Email: `bfp@test.com`
   - Password: `password123`

2. Dashboard should load successfully
3. Check browser console - no 403 errors
4. Stats cards should display data

### 3. Test Incident Filtering

1. As BFP user, navigate to `/incidents`
2. Should only see incidents assigned to BFP
3. "Assigned To" column should show BFP badge

### 4. Test Incident Creation from Mobile

1. Open mobile app
2. Report new incident
3. Select target agency (PNP/BFP/MDRRMO)
4. Submit incident
5. Verify:
   - Incident appears in web dashboard
   - Assigned agency is correct
   - Agency user receives notification

## Permission Matrix

| Role        | Analytics Read | Dashboard Access | Incident Filtering |
|-------------|----------------|------------------|--------------------|
| super_admin | ✅             | ✅ All data      | ❌ No filter       |
| admin       | ✅             | ✅ All data      | ❌ No filter       |
| mdrrmo      | ✅             | ✅ All data      | ❌ No filter       |
| pnp         | ✅             | ✅ PNP only      | ✅ PNP incidents   |
| bfp         | ✅             | ✅ BFP only      | ✅ BFP incidents   |
| lgu_officer | ❌             | ❌               | ✅ Jurisdiction    |
| citizen     | ❌             | ❌               | ✅ Own reports     |

## Files Modified

### Database
- ✅ `database/migrations/012_add_analytics_permission_agency_roles.sql` - New migration
- ✅ `database/apply-agency-analytics-permission.ps1` - Migration script

### Backend (Already Implemented)
- ✅ `backend/src/services/incident.service.ts` - Agency filtering logic
- ✅ `backend/src/controllers/incident.controller.ts` - Target agency handling
- ✅ `backend/src/services/notification.service.ts` - Agency notifications

### Frontend (Already Implemented)
- ✅ `web_app/src/app/(admin)/incidents/page.tsx` - Assigned agency display
- ✅ `mobile/src/screens/incidents/ReportIncidentScreen.tsx` - Agency selection UI
- ✅ `mobile/src/types/incident.ts` - TargetAgency type

## Next Steps

1. ✅ Apply database migration
2. ✅ Recompile backend TypeScript
3. ✅ Restart backend server
4. ⏳ Test BFP/PNP login and dashboard access
5. ⏳ Test incident creation with agency selection
6. ⏳ Verify agency filtering works correctly
7. ⏳ Test notifications to assigned agencies

## Troubleshooting

### Still Getting 403 Error

1. Check if migration was applied:
   ```sql
   SELECT * FROM role_permissions WHERE role IN ('pnp', 'bfp') AND resource = 'analytics';
   ```

2. Clear JWT token and login again (token caching issue)

3. Check backend logs for permission check:
   ```
   🔐 Permission check: { role: 'bfp', resource: 'analytics', action: 'read' }
   ```

### Backend Not Recompiled

If changes aren't reflected:

```powershell
# Clean dist folder
cd MOBILE_APP/backend
Remove-Item -Recurse -Force dist

# Rebuild
npm run build

# Restart
npm start
```

### Incidents Not Filtering

Check the query in backend logs:
```
AND assigned_user.role = 'bfp'
```

This should be present for agency roles.

## Related Documentation

- `INCIDENT_AGENCY_SELECTION_COMPLETE.md` - Agency selection feature
- `INCIDENT_ASSIGNED_AGENCY_DISPLAY.md` - Frontend display
- `database/migrations/004_seed_role_permissions.sql` - Base permissions
