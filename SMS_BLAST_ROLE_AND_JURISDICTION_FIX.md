# SMS Blast Role and Jurisdiction Fix - Complete ✅

## Problem Identified

User with PNP role was getting error:
```json
{
  "status": "error",
  "message": "Insufficient permissions for SMS blast operations"
}
```

User token payload:
```json
{
  "id": 12,
  "email": "pnp@test.safehaven.com",
  "role": "pnp",
  "jurisdiction": null,
  "jti": "a908be79-31af-4476-b891-381277c45e8e"
}
```

## Root Causes

### 1. Role Not Allowed in recipientFilter.service.ts ✅ FIXED

The `validateJurisdiction` method only allowed these roles:
- super_admin ✅
- admin ✅
- mdrrmo ✅

But NOT these roles:
- pnp ❌
- bfp ❌
- lgu_officer ❌
- lgu ❌

### 2. Null Jurisdiction ⚠️ NEEDS ATTENTION

The PNP user has `jurisdiction: null`, which will cause this error:
```json
{
  "status": "error",
  "message": "User has no jurisdiction assigned"
}
```

## Solution Applied

### Fixed recipientFilter.service.ts ✅

**Before:**
```typescript
// Admin and MDRRMO users must have jurisdiction restrictions
if (user.role === 'admin' || user.role === 'mdrrmo') {
  // ... jurisdiction checks
}

// Other roles don't have SMS blast access
return {
  isValid: false,
  error: 'Insufficient permissions for SMS blast operations'
};
```

**After:**
```typescript
// Admin, MDRRMO, PNP, BFP, LGU Officer, and LGU users must have jurisdiction restrictions
if (user.role === 'admin' || user.role === 'mdrrmo' || user.role === 'pnp' || user.role === 'bfp' || user.role === 'lgu_officer' || user.role === 'lgu') {
  // ... jurisdiction checks
}

// Citizens don't have SMS blast access
return {
  isValid: false,
  error: 'Insufficient permissions - SMS blast access restricted to government agencies only'
};
```

## Jurisdiction Requirement

All non-super_admin users MUST have a jurisdiction assigned to use SMS blast features.

### Jurisdiction Format

```
Province:City:Barangay
```

Examples:
- Province level: `Pangasinan`
- City level: `Pangasinan:Dagupan City`
- Barangay level: `Pangasinan:Dagupan City:Barangay 1`

### Why Jurisdiction is Required

1. **Security**: Prevents users from sending SMS to areas outside their authority
2. **Compliance**: Ensures messages are only sent to relevant jurisdictions
3. **Accountability**: Tracks which jurisdiction sent which messages

## How to Fix Null Jurisdiction

### Option 1: Update User in Database

```sql
-- Update PNP user with jurisdiction
UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE email = 'pnp@test.safehaven.com';
```

### Option 2: Use Existing Script

```powershell
# Run the jurisdiction assignment script
cd MOBILE_APP/backend
node assign-jurisdiction.js
```

### Option 3: Update via API

```bash
# Update user jurisdiction via API
curl -X PUT http://localhost:3001/api/v1/users/12 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jurisdiction": "Pangasinan"
  }'
```

## Testing

### 1. Test with Super Admin (No Jurisdiction Required)
```bash
# Super admin can access without jurisdiction
curl http://localhost:3001/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Should return 200 OK
```

### 2. Test with PNP User (After Adding Jurisdiction)
```bash
# First, add jurisdiction to PNP user
# Then test
curl http://localhost:3001/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer PNP_TOKEN"

# Should return 200 OK
```

### 3. Test with Citizen (Should Be Blocked)
```bash
curl http://localhost:3001/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer CITIZEN_TOKEN"

# Should return 403 Forbidden
```

## Roles and Jurisdiction Requirements

| Role | SMS Blast Access | Jurisdiction Required |
|------|-----------------|----------------------|
| super_admin | ✅ Yes | ❌ No |
| admin | ✅ Yes | ✅ Yes |
| mdrrmo | ✅ Yes | ✅ Yes |
| pnp | ✅ Yes | ✅ Yes |
| bfp | ✅ Yes | ✅ Yes |
| lgu_officer | ✅ Yes | ✅ Yes |
| lgu | ✅ Yes | ✅ Yes |
| citizen | ❌ No | N/A |

## Quick Fix for PNP User

Run this SQL command:

```sql
-- Add Pangasinan jurisdiction to PNP user
UPDATE users 
SET jurisdiction = 'Pangasinan' 
WHERE email = 'pnp@test.safehaven.com';
```

Or use PowerShell:

```powershell
# Connect to MySQL and update
cd MOBILE_APP/backend
$env:DB_HOST="localhost"
$env:DB_USER="root"
$env:DB_PASSWORD="your_password"
$env:DB_NAME="safehaven_db"

# Run update
mysql -h $env:DB_HOST -u $env:DB_USER -p$env:DB_PASSWORD $env:DB_NAME -e "UPDATE users SET jurisdiction = 'Pangasinan' WHERE email = 'pnp@test.safehaven.com';"
```

## Error Messages Explained

### "Insufficient permissions for SMS blast operations"
**Cause:** User role not in allowed list (was the issue with PNP)
**Fix:** ✅ Fixed in recipientFilter.service.ts

### "User has no jurisdiction assigned"
**Cause:** User has `jurisdiction: null`
**Fix:** ⚠️ Add jurisdiction to user in database

### "Access denied - province outside your jurisdiction"
**Cause:** User trying to send SMS to province they don't have access to
**Fix:** User can only send to their assigned jurisdiction

### "Insufficient permissions - SMS blast access restricted to government agencies only"
**Cause:** Citizen trying to access SMS blast
**Fix:** This is correct behavior - citizens cannot use SMS blast

## Files Modified

1. ✅ `backend/src/services/recipientFilter.service.ts` - Added all roles to jurisdiction check
2. ✅ `backend/dist/*` - Rebuilt with `npm run build`

## Next Steps

1. ✅ **Code Fixed** - recipientFilter.service.ts now allows all roles
2. ⏳ **Add Jurisdiction** - Update PNP user (and others) with jurisdiction
3. ⏳ **Test** - Verify SMS blast works with all roles
4. ⏳ **Deploy** - Push to production

## Quick Test Script

```powershell
# 1. Update PNP user jurisdiction
cd MOBILE_APP/backend
mysql -h localhost -u root -p safehaven_db -e "UPDATE users SET jurisdiction = 'Pangasinan' WHERE email = 'pnp@test.safehaven.com';"

# 2. Restart backend
npm run dev

# 3. Test SMS blast endpoint
# Login as PNP user and get token, then:
curl http://localhost:3001/api/v1/sms-blast/contact-groups \
  -H "Authorization: Bearer YOUR_PNP_TOKEN"

# Should return 200 OK with contact groups
```

## Status

✅ **Role Check Fixed** - All government roles now allowed
⚠️ **Jurisdiction Required** - Users need jurisdiction assigned
🔄 **Ready for Testing** - After adding jurisdiction to users

---

**Priority:** HIGH - Blocks SMS blast access for PNP, BFP, LGU roles
**Impact:** Enables SMS blast for all authorized government agencies
**Risk:** Low - Only enables existing security features
