# Permission Management Quick Start Guide

## Overview
The Permission Management interface allows super administrators to control role-based access permissions across the SafeHaven system.

## Accessing the Interface

1. **Login as Super Admin**
   - Only users with `super_admin` role can access this feature
   - Navigate to: `/permissions` in the admin dashboard

2. **Interface Location**
   - Web App: `http://localhost:3000/permissions`
   - Backend API: `http://localhost:3001/api/admin/permissions`

## Features

### 1. View All Permissions
- Permissions are grouped by role for easy management
- Each permission shows:
  - Resource (e.g., alerts, incidents, users)
  - Action (create, read, update, delete, execute)
  - Creation timestamp

### 2. Add New Permission

**Steps**:
1. Click the "Add Permission" button
2. Select a role from the dropdown (cannot select super_admin)
3. Enter the resource name (e.g., "alerts", "incidents")
4. Select an action (create, read, update, delete, execute)
5. Click "Add Permission"

**Example**:
```
Role: mdrrmo
Resource: analytics
Action: read
```

This grants MDRRMO users permission to read analytics data.

### 3. Remove Permission

**Steps**:
1. Find the permission in the list
2. Click the trash icon on the right
3. Confirm the removal

**Note**: Super admin permissions cannot be removed.

### 4. View Permission History

**Steps**:
1. Click "View History" button
2. See all permission changes with:
   - Action (Added/Removed)
   - Permission details
   - Status (Success/Failed)
   - Timestamp

### 5. Search and Filter

**Search**:
- Type in the search box to filter by role, resource, or action
- Results update in real-time

**Filter by Role**:
- Use the role dropdown to show permissions for specific roles
- Select "All Roles" to see everything

## Common Use Cases

### Grant Analytics Access to MDRRMO
```
Role: mdrrmo
Resource: analytics
Action: read
```

### Allow LGU Officers to Create Alerts
```
Role: lgu_officer
Resource: alerts
Action: create
```

### Enable PNP to Update Incidents
```
Role: pnp
Resource: incidents
Action: update
```

### Grant Citizens Read Access to Evacuation Centers
```
Role: citizen
Resource: evacuation_centers
Action: read
```

## API Usage

### List All Permissions
```bash
curl -X GET http://localhost:3001/api/admin/permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add Permission
```bash
curl -X POST http://localhost:3001/api/admin/permissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "mdrrmo",
    "resource": "analytics",
    "action": "read"
  }'
```

### Remove Permission
```bash
curl -X DELETE http://localhost:3001/api/admin/permissions/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Permission History
```bash
curl -X GET http://localhost:3001/api/admin/permissions/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Available Roles

1. **super_admin** - Cannot be modified (full system access)
2. **admin** - System administrators
3. **pnp** - Philippine National Police
4. **bfp** - Bureau of Fire Protection
5. **mdrrmo** - Municipal Disaster Risk Reduction and Management Office
6. **lgu_officer** - Local Government Unit Officers
7. **citizen** - Regular users

## Available Actions

1. **create** - Create new resources
2. **read** - View/read resources
3. **update** - Modify existing resources
4. **delete** - Remove resources
5. **execute** - Execute special operations

## Common Resources

- `alerts` - Disaster alerts
- `incidents` - Incident reports
- `sos_alerts` - SOS emergency alerts
- `evacuation_centers` - Evacuation center data
- `users` - User management
- `analytics` - System analytics
- `reports` - Report generation
- `fire_stations` - Fire station data (BFP)

## Security Notes

1. **Immediate Effect**: Permission changes take effect immediately without requiring users to log out and back in

2. **Audit Trail**: All permission changes are logged with:
   - Who made the change
   - What was changed
   - When it was changed
   - IP address and user agent

3. **Super Admin Protection**: Super admin permissions cannot be modified to prevent system lockout

4. **Cache Invalidation**: The system automatically clears permission caches when changes are made

## Troubleshooting

### "Permission already exists" Error
- This permission is already granted to the role
- Check the existing permissions list
- Remove the old permission first if you need to modify it

### "Cannot modify super_admin permissions" Error
- Super admin permissions are protected
- This is a security feature to prevent system lockout

### "Unauthorized" Error
- Ensure you're logged in as super_admin
- Check that your JWT token is valid
- Try logging out and back in

### Changes Not Taking Effect
- Permission changes should be immediate
- Try refreshing the page
- Check the permission history to verify the change was logged
- Contact system administrator if issues persist

## Best Practices

1. **Principle of Least Privilege**: Only grant permissions that are necessary for each role

2. **Regular Audits**: Review permission history regularly to ensure no unauthorized changes

3. **Test Changes**: After modifying permissions, test that the changes work as expected

4. **Document Changes**: Keep notes on why permissions were added or removed

5. **Backup Before Major Changes**: Consider backing up the role_permissions table before making significant changes

## Support

For issues or questions:
1. Check the audit logs for permission change history
2. Review the TASK_11_IMPLEMENTATION_SUMMARY.md for technical details
3. Contact the system administrator

## Related Documentation

- Enhanced RBAC System Requirements: `.kiro/specs/enhanced-rbac-system/requirements.md`
- Enhanced RBAC System Design: `.kiro/specs/enhanced-rbac-system/design.md`
- Implementation Summary: `MOBILE_APP/backend/TASK_11_IMPLEMENTATION_SUMMARY.md`
