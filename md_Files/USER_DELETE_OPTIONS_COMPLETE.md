# User Delete Options - Soft Delete vs Hard Delete ✅

## Feature Completed
Added option for users to choose between soft delete (deactivate) and hard delete (permanent removal) when deleting users.

## What Was Changed

### Backend Updates

#### 1. User Service (`backend/src/services/user.service.ts`)
Added `hardDelete` parameter to `deleteUser` method:

```typescript
async deleteUser(id: number, actorRole?: string, hardDelete: boolean = false) {
  // ... validation code ...
  
  if (hardDelete) {
    // Hard delete - permanently remove from database
    await db.query('DELETE FROM user_profiles WHERE user_id = ?', [id]);
    await db.query('DELETE FROM user_locations WHERE user_id = ?', [id]);
    await db.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  } else {
    // Soft delete - just deactivate
    await db.query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
}
```

#### 2. User Controller (`backend/src/controllers/user.controller.ts`)
Updated to accept `?hard=true` query parameter:

```typescript
async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  const hardDelete = req.query.hard === 'true';
  await userService.deleteUser(id, actorRole, hardDelete);
  
  res.json({
    status: 'success',
    message: hardDelete ? 'User permanently deleted' : 'User deactivated successfully'
  });
}
```

### Frontend Updates

#### 1. API Client (`web_app/src/lib/safehaven-api.ts`)
Updated delete method to support hard delete:

```typescript
delete: async (id: number, hardDelete: boolean = false) => {
  const response = await api.delete(`/users/${id}${hardDelete ? '?hard=true' : ''}`);
  return response.data;
}
```

#### 2. Users Page (`web_app/src/app/(admin)/users/page.tsx`)
Added beautiful delete confirmation dialog with two options:

- Added state for delete dialog and user to delete
- Created `handleDeleteClick` to show dialog
- Updated `handleDelete` to accept hardDelete parameter
- Added comprehensive delete dialog UI

## How It Works

### User Flow

1. Admin clicks the delete button (trash icon) on a user
2. A dialog appears with two options:

#### Option 1: Soft Delete (Recommended) - Orange/Warning
- Deactivates the user account
- User cannot log in
- All data is preserved in database
- Can be filtered to view later
- Good for audit trails and compliance

#### Option 2: Hard Delete (Permanent) - Red/Error
- Permanently removes user from database
- Deletes all related records:
  - User profile
  - User locations
  - User permissions
  - User account
- Cannot be undone
- Requires additional confirmation
- Use only when absolutely necessary

### Delete Dialog UI

The dialog shows:
- User information (name, email, phone)
- Two clearly distinguished options with color coding
- Warning messages explaining each option
- Separate buttons for each action
- Cancel button to abort

### Security Features

1. **Role Hierarchy**: Cannot delete users with equal or higher privilege
2. **Self-Protection**: Cannot delete your own account
3. **Double Confirmation**: Hard delete requires additional confirmation
4. **Audit Trail**: Soft delete preserves data for auditing

## API Endpoints

### Soft Delete (Default)
```
DELETE /users/:id
```

### Hard Delete
```
DELETE /users/:id?hard=true
```

## Testing

### Test Soft Delete
1. Go to http://localhost:3000/users
2. Click delete button on a user
3. Click "Deactivate User" (orange button)
4. User disappears from active list
5. Change filter to "Inactive" - user appears with inactive badge
6. User cannot log in

### Test Hard Delete
1. Go to http://localhost:3000/users
2. Click delete button on a user
3. Click "Permanently Delete" (red button)
4. Confirm the additional warning
5. User is completely removed from database
6. User will not appear in any filter
7. All related data is deleted

### Test Restrictions
1. Try to delete your own account - should be blocked
2. Try to delete a user with higher privilege - should be blocked
3. Try to delete an already inactive user - button should be disabled

## Database Impact

### Soft Delete
- Updates `users.is_active = FALSE`
- Preserves all data
- No foreign key issues

### Hard Delete
Deletes or updates records from multiple tables:

**Deleted Records:**
1. `user_profiles` - Profile data
2. `user_locations` - Location data
3. `user_permissions` - Custom permissions
4. `token_blacklist` - Blacklisted tokens
5. `audit_logs` - User audit logs
6. `group_members` - Group memberships
7. `shared_locations` - Shared location data
8. `location_history` - Location history
9. `password_reset_tokens` - Password reset tokens
10. `offline_queue` - Offline sync queue
11. `sms_blast_analytics` - SMS analytics
12. `sos_alerts` - SOS alerts created by user
13. `incidents` - Incidents reported by user
14. `sms_blasts` - SMS blasts created by user
15. `sms_templates` - SMS templates created by user
16. `contact_groups` - Contact groups created by user
17. `disaster_alerts` - Disaster alerts created by user
18. `groups` - Groups created by user
19. `users` - Main user record

**Updated Records (SET NULL):**
- `notifications.user_id` - Set to NULL
- `sms_queue.user_id` - Set to NULL
- `sos_alerts.responder_id` - Set to NULL (if user was responder)

## Benefits

1. **Flexibility**: Choose appropriate deletion method per situation
2. **Data Preservation**: Soft delete keeps audit trail
3. **Compliance**: Meet data retention requirements
4. **Clean Database**: Hard delete for test/spam accounts
5. **User Safety**: Clear warnings prevent accidental permanent deletion
6. **Better UX**: Visual distinction between options

## Recommendations

### Use Soft Delete For:
- Regular user accounts
- Accounts with important data
- Compliance/audit requirements
- Temporary deactivation
- Suspicious accounts (keep for investigation)
- Users who created important content (SOS, incidents, alerts)

### Use Hard Delete For:
- Test accounts
- Duplicate accounts
- Spam/bot accounts
- GDPR "right to be forgotten" requests
- Database cleanup
- Accounts with no important content

### ⚠️ Warning About Hard Delete
Hard delete will permanently remove:
- All user data
- All content created by the user (SOS alerts, incidents, SMS blasts, etc.)
- All audit logs for the user
- All location history
- All group memberships

This is irreversible! Use with extreme caution.

## Backend Restart Required

After these changes, restart the backend:

```powershell
cd MOBILE_APP/backend
npm start
```

---

**Status**: ✅ Complete
**Date**: Context Transfer Session
**Files Modified**: 
- `backend/src/services/user.service.ts`
- `backend/src/controllers/user.controller.ts`
- `web_app/src/lib/safehaven-api.ts`
- `web_app/src/app/(admin)/users/page.tsx`
**Backend Compiled**: ✅ Yes
**Backend Restart Needed**: ⚠️ Yes
