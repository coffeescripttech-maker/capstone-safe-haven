# Group Join Fix - Invalid Invite Code Error

## Problem

When users try to join a family group using an invite code in the mobile app, they get:
- Error: "Invalid invite code"
- Status code: 400
- Backend error: `Error: Invalid invite code at GroupService.joinGroup`

## Root Cause

The family groups tables (`groups`, `group_members`, `location_shares`, `group_alerts`) may not exist in the database yet, causing the invite code lookup to fail.

## Solution

### 1. Create Family Groups Tables

Run the setup script to create all required tables:

```powershell
cd MOBILE_APP/backend
.\setup-family-groups-now.ps1
```

This will create:
- `groups` table (with invite_code column)
- `group_members` table
- `location_shares` table
- `group_alerts` table

### 2. Verify Tables Exist

Check if tables were created:

```sql
SHOW TABLES LIKE '%group%';
```

Expected output:
- groups
- group_members
- group_alerts
- location_shares

### 3. Test Group Join Flow

Run the test script:

```powershell
cd MOBILE_APP/backend
.\test-group-join.ps1
```

This will:
1. Login as user 1 and create a group
2. Get the invite code
3. Login as user 2 and join using the invite code
4. Verify both users are in the group

## How It Works

### Group Creation Flow
1. User creates a group with a name
2. Backend generates an 8-character invite code (e.g., "ABC12345")
3. Code is stored in `groups.invite_code` column
4. Creator is added as admin in `group_members` table

### Group Join Flow
1. User enters 8-character invite code
2. Mobile app sends to `/api/v1/groups/join` with `{ inviteCode: "ABC12345" }`
3. Backend looks up group: `SELECT * FROM groups WHERE invite_code = ? AND is_active = TRUE`
4. If found, adds user as member in `group_members` table
5. Returns group details to mobile app

## Code Flow

### Mobile App (JoinGroupScreen.tsx)
```typescript
const handleJoin = async () => {
  const code = inviteCode.trim().toUpperCase();
  const group = await groupService.joinGroup({ inviteCode: code });
  // Success!
}
```

### Backend (group.service.ts)
```typescript
async joinGroup(userId: number, inviteCode: string): Promise<any> {
  // Find group by invite code
  const [groups] = await pool.query<Group[]>(
    'SELECT * FROM `groups` WHERE invite_code = ? AND is_active = TRUE',
    [inviteCode]
  );

  if (groups.length === 0) {
    throw new Error('Invalid invite code'); // ← This is the error
  }
  
  // Add user as member
  await pool.query(
    'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, \'member\')',
    [group.id, userId]
  );
  
  return group;
}
```

## Testing

### Manual Test in Mobile App

1. User A: Create a group
   - Go to Family Locator → Create Group
   - Enter group name
   - Copy the invite code shown

2. User B: Join the group
   - Go to Family Locator → Join Group
   - Enter the invite code
   - Should see success message

### API Test with cURL

```bash
# 1. Login and create group
curl -X POST http://192.168.43.25:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@test.com","password":"password123"}'

# Save token as TOKEN1

curl -X POST http://192.168.43.25:3001/api/v1/groups \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Family","description":"Test group"}'

# Save inviteCode from response

# 2. Login as another user and join
curl -X POST http://192.168.43.25:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sheilla@test.com","password":"password123"}'

# Save token as TOKEN2

curl -X POST http://192.168.43.25:3001/api/v1/groups/join \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"ABC12345"}'
```

## Files Involved

### Backend
- `MOBILE_APP/backend/src/services/group.service.ts` - Group business logic
- `MOBILE_APP/backend/src/controllers/group.controller.ts` - API endpoints
- `MOBILE_APP/database/family_groups.sql` - Database schema

### Mobile App
- `MOBILE_APP/mobile/src/screens/family/JoinGroupScreen.tsx` - Join UI
- `MOBILE_APP/mobile/src/services/groups.ts` - API calls

### Scripts
- `MOBILE_APP/backend/setup-family-groups-now.ps1` - Create tables
- `MOBILE_APP/backend/test-group-join.ps1` - Test join flow

## Common Issues

### Issue 1: "Invalid invite code" even with correct code
**Cause:** Tables don't exist in database
**Fix:** Run `setup-family-groups-now.ps1`

### Issue 2: "Already a member of this group"
**Cause:** User already joined
**Fix:** This is expected behavior, user can only join once

### Issue 3: Invite code not generated
**Cause:** Group creation failed
**Fix:** Check backend logs for errors during group creation

## Status

✅ **READY TO FIX** - Run the setup script to create tables

---

**Date:** March 21, 2026
**Issue:** Invalid invite code error when joining groups
**Resolution:** Create family groups tables in database
