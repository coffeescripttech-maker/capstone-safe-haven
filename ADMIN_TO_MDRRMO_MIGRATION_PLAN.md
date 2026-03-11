# Admin to MDRRMO Role Migration Plan

## Requirement

Change the main "admin" user's role from `admin` to `mdrrmo` so that:
- SOS alerts sent to MDRRMO go to the actual admin user
- Incidents assigned to MDRRMO go to the actual admin user
- The "mdrrmo test" user is no longer needed
- All existing functionality continues to work

## Current Situation

**Users:**
- `admin@test.com` - role: `admin` (main admin user)
- `mdrrmo@test.com` - role: `mdrrmo` (test user, not used)

**Problem:**
When citizens send SOS/incidents to MDRRMO, they go to `mdrrmo@test.com` instead of the main admin.

## Solution

Change `admin@test.com` role from `admin` → `mdrrmo`

## Impact Analysis

### ✅ Safe Changes (No Code Impact)

These features check for `admin` OR `mdrrmo` OR `super_admin`, so changing admin→mdrrmo is safe:

1. **Dashboard Access** - Checks for privileged roles
2. **Data Filtering** - Both admin and mdrrmo see all data
3. **Incident Filtering** - Both see all incidents
4. **SOS Filtering** - Both see all SOS alerts
5. **Analytics Access** - Both have analytics read permission

### ⚠️ Requires Code Update

These features specifically check for `role === 'admin'`:

1. **Recipient Filtering** (SMS Blast) - Jurisdiction restrictions
2. **Contact Group Management** - Admin-specific filtering
3. **Token Expiry** - Admin gets 4-hour tokens
4. **Permission Checks** - Some admin-specific logic

### 🔧 Code Changes Needed

#### 1. Update Role Checks to Include MDRRMO

**Pattern to Replace:**
```typescript
// OLD
if (role === 'admin') { ... }

// NEW
if (role === 'admin' || role === 'mdrrmo') { ... }
```

**Files to Update:**
- `backend/src/services/recipientFilter.service.ts` (3 occurrences)
- `backend/src/services/contactGroupManager.service.ts` (1 occurrence)
- `backend/src/middleware/smsAuth.ts` (1 occurrence)
- `backend/src/services/auth.service.ts` (1 occurrence - token expiry)
- `backend/src/controllers/smsBlast.controller.ts` (2 occurrences)

#### 2. Update UI Labels

**Files to Update:**
- `web_app/src/components/users/UserTable.tsx` - Role badge display
- `web_app/src/components/user-profile/UserProfileCard.tsx` - Profile display
- `web_app/src/components/users/UserForm.tsx` - Form help text

## Migration Steps

### Step 1: Update Backend Code

Update all `role === 'admin'` checks to include `mdrrmo`:

```typescript
// Pattern 1: Simple check
if (role === 'admin' || role === 'mdrrmo') { ... }

// Pattern 2: Array includes
if (['admin', 'mdrrmo', 'super_admin'].includes(role)) { ... }
```

### Step 2: Update Database

```sql
-- Change admin user role to mdrrmo
UPDATE users 
SET role = 'mdrrmo',
    first_name = 'MDRRMO',
    last_name = 'Admin'
WHERE email = 'admin@test.com';

-- Optional: Delete old mdrrmo test user
DELETE FROM users WHERE email = 'mdrrmo@test.com';
```

### Step 3: Recompile & Restart

```powershell
cd MOBILE_APP/backend
npm run build
npm start
```

### Step 4: Test

1. Login as `admin@test.com` (now MDRRMO role)
2. Verify dashboard access
3. Send SOS to MDRRMO - should go to admin@test.com
4. Create incident assigned to MDRRMO - should go to admin@test.com
5. Test SMS blast functionality
6. Test contact group management

## Backward Compatibility

To maintain compatibility with existing code that checks for `admin`:

**Option A: Keep Both Roles (Recommended)**
- Update code to check for both `admin` and `mdrrmo`
- Allows flexibility for future admin users
- No breaking changes

**Option B: Replace All Admin References**
- Replace all `admin` checks with `mdrrmo`
- More invasive changes
- Risk of breaking something

**Recommendation:** Use Option A

## Files to Modify

### Backend Services (6 files)

1. `backend/src/services/recipientFilter.service.ts`
   - Line 127: Jurisdiction restrictions
   - Line 247: Jurisdiction restrictions
   - Line 400: Jurisdiction validation

2. `backend/src/services/contactGroupManager.service.ts`
   - Line 184: Contact group filtering

3. `backend/src/middleware/smsAuth.ts`
   - Line 201: Jurisdiction check

4. `backend/src/services/auth.service.ts`
   - Line 258: Token expiry time

5. `backend/src/controllers/smsBlast.controller.ts`
   - Line 790: Contact group filtering
   - Line 1206: Location filtering

6. `backend/src/services/dataFilter.service.ts`
   - Already checks for both admin and super_admin
   - Add mdrrmo to these checks

### Frontend Components (3 files)

1. `web_app/src/components/users/UserTable.tsx`
   - Update role badge to show MDRRMO icon

2. `web_app/src/components/user-profile/UserProfileCard.tsx`
   - Update role display

3. `web_app/src/components/users/UserForm.tsx`
   - Update role description

## Testing Checklist

### Backend Tests
- [ ] Login as admin@test.com (now MDRRMO)
- [ ] Dashboard loads correctly
- [ ] Can see all incidents
- [ ] Can see all SOS alerts
- [ ] Can manage users
- [ ] Can send SMS blasts
- [ ] Can manage contact groups
- [ ] Token expiry is 4 hours

### SOS/Incident Assignment
- [ ] Send SOS to MDRRMO from mobile app
- [ ] Verify admin@test.com receives notification
- [ ] Create incident assigned to MDRRMO
- [ ] Verify admin@test.com sees the incident
- [ ] Update incident status as MDRRMO

### Mobile App
- [ ] SOS agency selection shows MDRRMO
- [ ] Incident agency selection shows MDRRMO
- [ ] Notifications work correctly

### Web App
- [ ] User profile shows correct role
- [ ] User table shows correct role badge
- [ ] Permissions work correctly
- [ ] SMS blast features work

## Rollback Plan

If something breaks:

```sql
-- Rollback: Change back to admin
UPDATE users 
SET role = 'admin',
    first_name = 'Admin',
    last_name = 'User'
WHERE email = 'admin@test.com';
```

Then restart backend server.

## Summary

**Safe Approach:**
1. Update backend code to accept both `admin` and `mdrrmo` roles
2. Change database: admin@test.com role → mdrrmo
3. Test thoroughly
4. Keep backward compatibility

**Benefits:**
- SOS/incidents to MDRRMO go to correct user
- No breaking changes
- Easy to rollback
- Future-proof for multiple admin users
