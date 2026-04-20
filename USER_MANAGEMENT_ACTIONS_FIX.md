# User Management Role-Based Permissions

## Overview
User management now has role-based permissions where MDRRMO and Admin roles can manage users (add, view, edit) but only Super Admin can delete users.

## Role Permissions

### Super Admin
✅ View user details
✅ Add new users
✅ Edit user information
✅ Delete users (soft/hard delete)

### Admin / MDRRMO
✅ View user details
✅ Add new users
✅ Edit user information
❌ Delete users (button hidden)

### Other Roles
Access to user management page is restricted based on permissions.

## Changes Made

### 1. Users List Page (`/users/page.tsx`)
✅ Added authentication context import (`useSafeHavenAuth`)
✅ Get current user from auth context
✅ Check if current user is `super_admin`
✅ Delete button only visible for `super_admin` role
✅ MDRRMO/Admin can still add and edit users
✅ Three action buttons with role-based visibility

**Action Buttons:**
- **Details** (Eye icon) - Blue/Brand color - View user details page (All roles)
- **Edit** (Edit icon) - Info color - Open edit modal popup (All roles)
- **Delete** (Trash icon) - Error/Red color - Delete user (Super Admin only)

### 2. User Details Page (`/users/[id]/page.tsx`)
✅ Delete button already removed from details page
✅ All roles can view and edit user details

## User Flow

### Super Admin:
1. **Details Button** → Navigate to `/users/{id}` (view full user details)
2. **Edit Button** → Open edit modal popup (quick edit without leaving page)
3. **Delete Button** → Open delete confirmation dialog (soft/hard delete options)
4. Can add new users via "Add User" button

### Admin / MDRRMO:
1. **Details Button** → Navigate to `/users/{id}` (view full user details)
2. **Edit Button** → Open edit modal popup (quick edit without leaving page)
3. **Delete Button** → Hidden (not visible)
4. Can add new users via "Add User" button

### Edit Modal Features:
- Pre-filled with current user data
- Update first name, last name
- Change role and jurisdiction
- Update location (city, province, barangay)
- Change account status (active/inactive)
- Email and phone are read-only (cannot be changed)
- Save or cancel changes
- Automatically refreshes user list after update

## Benefits

✅ Role-based access control for user deletion
✅ MDRRMO/Admin can manage users without delete permission
✅ Prevents accidental user deletion by non-super-admin roles
✅ Clear separation of permissions
✅ Edit modal popup keeps users on the same page
✅ Quick edits without full page navigation
✅ Consistent UX with Add User modal

## Security

- Delete functionality restricted to `super_admin` role only
- Frontend check: Delete button hidden for non-super-admin
- Backend should also validate role before allowing deletion
- MDRRMO/Admin can still perform all other user management tasks

## Files Modified

1. `MOBILE_APP/web_app/src/app/(admin)/users/page.tsx`
   - Added `useSafeHavenAuth` import
   - Added `currentUser` from auth context
   - Added `canDeleteUsers` check (only super_admin)
   - Wrapped Delete button in conditional render `{canDeleteUsers && ...}`
   - All other functionality remains the same

2. `MOBILE_APP/web_app/src/app/(admin)/users/[id]/page.tsx`
   - Delete button already removed (no changes needed)

## Testing

Test the following scenarios:

### As Super Admin:
1. ✅ All three buttons visible (Details, Edit, Delete)
2. ✅ Can click Delete button and see confirmation dialog
3. ✅ Can add new users
4. ✅ Can edit existing users

### As Admin/MDRRMO:
1. ✅ Only two buttons visible (Details, Edit)
2. ✅ Delete button is hidden
3. ✅ Can add new users
4. ✅ Can edit existing users
5. ✅ Can view user details

### General:
1. ✅ Edit modal works for all roles
2. ✅ Add user modal works for all roles
3. ✅ User list displays correctly
4. ✅ All buttons clearly labeled
