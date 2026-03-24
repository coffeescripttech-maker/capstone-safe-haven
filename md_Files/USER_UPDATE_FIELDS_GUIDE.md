# User Update Fields Guide

## User Edit Page - Field Status

The user edit page at `http://localhost:3000/users/[id]` allows updating the following fields:

### ✅ Editable Fields

1. **First Name** (`first_name`)
   - Text input
   - Can be updated

2. **Last Name** (`last_name`)
   - Text input
   - Can be updated

3. **Role** (`role`)
   - Dropdown select
   - Options: citizen, lgu_officer, mdrrmo, bfp, pnp, admin, super_admin
   - Can be updated (with role hierarchy validation)

4. **Jurisdiction** (`jurisdiction`)
   - Text input
   - Only shown for roles: admin, pnp, bfp, mdrrmo, lgu_officer
   - Can be updated

5. **Account Status** (`is_active`)
   - Dropdown select (Active/Inactive)
   - Can be updated

6. **City** (`city`)
   - Text input
   - Can be updated

7. **Province** (`province`)
   - Text input
   - Can be updated

8. **Barangay** (`barangay`)
   - Text input
   - Can be updated

### ❌ Read-Only Fields

1. **Email** (`email`)
   - Cannot be changed
   - Shown with note: "Email cannot be changed"

2. **Phone** (`phone`)
   - Cannot be changed
   - Shown with note: "Phone cannot be changed"

3. **Created At** (`created_at`)
   - Display only

4. **Last Login** (`last_login`)
   - Display only

5. **Email Verified** (`is_verified`)
   - Display only

## API Endpoint

**PUT** `/api/v1/users/:id`

### Request Body

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "role": "mdrrmo",
  "jurisdiction": "Legazpi City",
  "is_active": true,
  "city": "Legazpi City",
  "province": "Albay",
  "barangay": "Barangay 1"
}
```

### Response

```json
{
  "status": "success",
  "data": {
    "id": 18,
    "email": "user@example.com",
    "phone": "+639123456789",
    "first_name": "John",
    "last_name": "Doe",
    "role": "mdrrmo",
    "jurisdiction": "Legazpi City",
    "is_active": true,
    "city": "Legazpi City",
    "province": "Albay",
    "barangay": "Barangay 1",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

## Role Hierarchy Validation

The backend enforces role hierarchy when updating users:

| Actor Role | Can Modify Roles |
|------------|------------------|
| super_admin | All roles |
| admin | citizen, lgu_officer, pnp, bfp, mdrrmo |
| mdrrmo | citizen, lgu_officer |
| pnp | citizen |
| bfp | citizen |
| lgu_officer | citizen |
| citizen | None |

### Rules:
1. Users cannot modify their own role (except super_admin)
2. Users can only modify roles below them in the hierarchy
3. Only super_admin can create/modify other super_admins

## Password Reset

Password reset is a separate action:

**POST** `/api/v1/users/:id/reset-password`

```json
{
  "password": "NewPassword123!"
}
```

## Testing the Update

### Test 1: Update Basic Info

```powershell
$token = "your_token_here"
$userId = 18

$body = @{
  first_name = "Updated"
  last_name = "Name"
  city = "Legazpi City"
  province = "Albay"
  barangay = "Barangay 1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/$userId" `
  -Method Put `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "ngrok-skip-browser-warning" = "true"
  } `
  -Body $body
```

### Test 2: Update Role

```powershell
$body = @{
  role = "mdrrmo"
  jurisdiction = "Legazpi City"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/$userId" `
  -Method Put `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "ngrok-skip-browser-warning" = "true"
  } `
  -Body $body
```

### Test 3: Deactivate User

```powershell
$body = @{
  is_active = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/$userId" `
  -Method Put `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "ngrok-skip-browser-warning" = "true"
  } `
  -Body $body
```

## Common Issues

### Issue 1: 403 Forbidden

**Cause:** Trying to modify a user with higher role than yours

**Solution:** Login as super_admin or admin

### Issue 2: 401 Unauthorized

**Cause:** Token expired or invalid

**Solution:** Login again to get a new token

### Issue 3: Cannot modify own role

**Cause:** Trying to change your own role (not allowed except for super_admin)

**Solution:** Have another admin change your role

### Issue 4: Email/Phone not updating

**Cause:** These fields are read-only by design

**Solution:** These cannot be changed through the UI (security measure)

## Summary

The user update functionality is fully working with the following capabilities:

✅ Update name (first_name, last_name)
✅ Update role (with hierarchy validation)
✅ Update jurisdiction
✅ Update location (city, province, barangay)
✅ Activate/deactivate account
✅ Reset password (separate endpoint)
❌ Cannot change email (security)
❌ Cannot change phone (security)
❌ Cannot modify own role (except super_admin)

All fields in the edit form are functional and connected to the backend API.
