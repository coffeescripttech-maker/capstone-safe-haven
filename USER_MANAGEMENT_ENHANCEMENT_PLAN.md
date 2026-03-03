# User Management Enhancement Plan

## Current State Analysis

### Existing Features ✅
- View all users list
- Filter by role and status
- Search users
- View user statistics
- Delete/deactivate users
- View user details (route exists but page missing)

### Missing Features ❌
1. **Create New User** - No endpoint or UI
2. **Edit User** - Endpoint exists but no UI
3. **User Detail Page** - Route exists but page missing (`/users/[id]`)
4. **Role Management** - Need proper RBAC role selection

## RBAC Roles (7 Total)

Based on database migration `001_enhance_rbac_users_table.sql`:

1. **super_admin** - Highest level, full system access
2. **admin** - Administrative access
3. **pnp** - Philippine National Police
4. **bfp** - Bureau of Fire Protection
5. **mdrrmo** - Municipal Disaster Risk Reduction and Management Office
6. **lgu_officer** - Local Government Unit Officer
7. **citizen** - Regular user (default)

## Implementation Plan

### TASK 1: Add Create User Endpoint (Backend)

**File**: `MOBILE_APP/backend/src/routes/user.routes.ts`

Add route:
```typescript
// Create user - requires 'create' permission on 'users' resource
router.post('/', authenticate, requirePermission('users', 'create'), userController.createUser.bind(userController));
```

**File**: `MOBILE_APP/backend/src/controllers/user.controller.ts`

Add method:
```typescript
async createUser(req: Request, res: Response) {
  // Validate input
  // Check role hierarchy (can't create user with higher role)
  // Hash password
  // Create user in database
  // Return created user
}
```

### TASK 2: Create User Detail Page (Frontend)

**File**: `MOBILE_APP/web_app/src/app/(admin)/users/[id]/page.tsx` (NEW)

Features:
- Display user information
- Edit user details
- Change user role (with RBAC validation)
- Update jurisdiction
- Reset password
- Activate/deactivate user
- View user activity logs

### TASK 3: Create "Add User" Modal/Page (Frontend)

**File**: `MOBILE_APP/web_app/src/app/(admin)/users/page.tsx` (UPDATE)

Add:
- "Add User" button in header
- Modal or navigate to create page
- Form with fields:
  - Email
  - Phone
  - First Name
  - Last Name
  - Password
  - Role (dropdown with 7 roles)
  - Jurisdiction (for admin roles)
  - City/Province

### TASK 4: Update Users API (Frontend)

**File**: `MOBILE_APP/web_app/src/lib/safehaven-api.ts`

Add methods:
```typescript
usersApi: {
  create: async (userData) => { ... },
  update: async (id, updates) => { ... },
  getById: async (id) => { ... },
  resetPassword: async (id, newPassword) => { ... }
}
```

### TASK 5: Role-Based Permissions

Ensure proper permission checks:
- **super_admin**: Can create/edit all roles
- **admin**: Can create/edit roles below admin (pnp, bfp, mdrrmo, lgu_officer, citizen)
- **Others**: Cannot create/edit users

## UI Design

### User List Page Enhancements
```
[Header]
  User Management
  [Refresh] [+ Add User]

[Stats Cards]
  Total | Active | Verified | New This Week

[Filters]
  Search | Role Filter | Status Filter

[Table]
  User Details | Contact | Location | Role | Status | Actions
  [View] [Edit] [Delete]
```

### User Detail/Edit Page
```
[Header]
  User Profile - [Name]
  [Back] [Save Changes]

[Tabs]
  Overview | Activity | Permissions

[Overview Tab]
  Personal Information
    - Email, Phone, Name
  
  Role & Access
    - Role (dropdown with 7 options)
    - Jurisdiction (for admin roles)
    - Status (Active/Inactive)
  
  Location
    - City, Province, Barangay
  
  Actions
    - Reset Password
    - Deactivate Account
```

### Add User Modal
```
Create New User

Personal Information
  First Name: [____]
  Last Name:  [____]
  Email:      [____]
  Phone:      [____]

Account Details
  Password:   [____]
  Role:       [Dropdown: 7 roles]
  Jurisdiction: [____] (if admin role)

Location (Optional)
  City:     [____]
  Province: [____]

[Cancel] [Create User]
```

## Role Dropdown Options

```typescript
const roleOptions = [
  { value: 'citizen', label: '👤 Citizen', description: 'Regular app user' },
  { value: 'lgu_officer', label: '👮 LGU Officer', description: 'Local government officer' },
  { value: 'mdrrmo', label: '🚨 MDRRMO', description: 'Disaster management officer' },
  { value: 'bfp', label: '🚒 BFP', description: 'Bureau of Fire Protection' },
  { value: 'pnp', label: '👮‍♂️ PNP', description: 'Philippine National Police' },
  { value: 'admin', label: '🛡️ Admin', description: 'System administrator' },
  { value: 'super_admin', label: '⭐ Super Admin', description: 'Full system access' }
];
```

## Permission Matrix

| Action | super_admin | admin | pnp/bfp/mdrrmo | lgu_officer | citizen |
|--------|-------------|-------|----------------|-------------|---------|
| View Users | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create User | ✅ | ✅ (limited) | ❌ | ❌ | ❌ |
| Edit User | ✅ | ✅ (limited) | ❌ | ❌ | ❌ |
| Delete User | ✅ | ✅ (limited) | ❌ | ❌ | ❌ |
| Change Role | ✅ | ✅ (limited) | ❌ | ❌ | ❌ |
| Reset Password | ✅ | ✅ | ❌ | ❌ | ❌ |

## Validation Rules

### Create User
- Email must be unique
- Phone must be unique
- Password minimum 8 characters
- Role must be valid enum value
- Can't create user with role higher than own role
- Jurisdiction required for admin roles

### Edit User
- Can't change own role
- Can't promote user to role higher than own role
- Can't edit user with higher role than own
- Email/phone must remain unique

## API Endpoints

### Existing
- `GET /api/v1/users` - List users
- `GET /api/v1/users/statistics` - Get stats
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `POST /api/v1/users/:id/reset-password` - Reset password

### To Add
- `POST /api/v1/users` - Create user ❌ MISSING

## Database Fields

### users table
```sql
- id
- email (unique)
- phone (unique)
- password_hash
- first_name
- last_name
- role (ENUM: 7 values)
- jurisdiction (VARCHAR)
- is_verified
- is_active
- created_at
- updated_at
- last_login
```

### user_profiles table
```sql
- user_id
- address
- city
- province
- barangay
- blood_type
- medical_conditions
- emergency_contact_name
- emergency_contact_phone
- latitude
- longitude
```

## Implementation Priority

1. **HIGH**: Add create user endpoint (backend)
2. **HIGH**: Create user detail page (frontend)
3. **HIGH**: Add "Add User" button and modal (frontend)
4. **MEDIUM**: Update users API methods (frontend)
5. **MEDIUM**: Add role-based validation
6. **LOW**: Add activity logs view
7. **LOW**: Add bulk user import

## Testing Checklist

- [ ] Super admin can create all role types
- [ ] Admin can create roles below admin
- [ ] Can't create duplicate email/phone
- [ ] Password validation works
- [ ] Role dropdown shows correct options
- [ ] Jurisdiction field shows for admin roles
- [ ] Edit user updates correctly
- [ ] Can't promote user above own role
- [ ] Reset password works
- [ ] Deactivate user works
- [ ] User detail page loads
- [ ] All RBAC permissions enforced

## Next Steps

1. Implement create user endpoint
2. Create user detail page
3. Add create user modal
4. Update API methods
5. Test all functionality
6. Document for production

