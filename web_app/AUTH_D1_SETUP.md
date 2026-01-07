# 🔐 Authentication with D1 Database - Setup Guide

## ✅ What's Been Done

Your authentication system is now integrated with the remote Cloudflare D1 database!

### Files Created:
- `database/users-schema.sql` - Users table schema
- `src/lib/d1-users.ts` - D1 user database client
- `scripts/d1-setup-users.js` - Setup script for users table

### Files Updated:
- `src/lib/auth.ts` - Now uses D1 database for authentication
- `package.json` - Added user management scripts

---

## 🚀 Setup Instructions

### Step 1: Create Users Table

Run this command to create the users table in your remote D1 database:

```bash
npm run db:users:setup
```

This will:
- Create the `users` table
- Add indexes for performance
- Insert 2 default users:
  - Admin: `admin@example.com` / `admin123`
  - User: `user@example.com` / `user123`

### Step 2: Verify Users

Check that users were created:

```bash
npm run db:users:list
```

You should see:
```
┌────┬──────────────────────┬────────────┬───────┐
│ id │ email                │ name       │ role  │
├────┼──────────────────────┼────────────┼───────┤
│ 1  │ admin@example.com    │ Admin User │ admin │
│ 2  │ user@example.com     │ Regular User│ user  │
└────┴──────────────────────┴────────────┴───────┘
```

### Step 3: Test Login

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Go to: https://dubail-film-maker-website-portfolio.vercel.app/signin

3. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

---

## 📊 Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Available Commands

### User Management:
```bash
# Setup users table
npm run db:users:setup

# List all users
npm run db:users:list

# Query specific user
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM users WHERE email='admin@example.com';"
```

### Add New User Manually:
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="INSERT INTO users (id, email, password, name, role) VALUES ('3', 'newuser@example.com', 'password123', 'New User', 'user');"
```

### Update User Password:
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="UPDATE users SET password='newpassword' WHERE email='admin@example.com';"
```

### Delete User:
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="DELETE FROM users WHERE email='user@example.com';"
```

---

## 🔐 Security Notes

### Current Setup (Development):
- ⚠️ Passwords are stored in **plain text**
- ⚠️ This is **NOT secure** for production

### For Production:

#### 1. Install bcrypt:
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

#### 2. Update `src/lib/auth.ts`:
```typescript
import bcrypt from 'bcrypt';

// In authorize function:
const isValid = await bcrypt.compare(credentials.password, user.password);
```

#### 3. Hash passwords when creating users:
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 4. Update existing passwords:
```javascript
// Run this script to hash existing passwords
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Then update in database
```

---

## 📝 User Roles

### Admin Role:
- Full access to all features
- Can manage projects
- Can access all routes

### User Role:
- Limited access
- Can view projects
- Cannot delete or modify

### Adding More Roles:
Update the `role` field in the database:
```sql
ALTER TABLE users ADD COLUMN permissions TEXT;
```

---

## 🎯 API Functions Available

From `src/lib/d1-users.ts`:

```typescript
// Get user by email
const user = await getUserByEmail('admin@example.com');

// Get user by ID
const user = await getUserById('1');

// Create new user
const newUser = await createUser({
  email: 'new@example.com',
  password: 'password123', // Should be hashed
  name: 'New User',
  role: 'user'
});

// Update user
const updated = await updateUser('1', {
  name: 'Updated Name',
  password: 'newpassword' // Should be hashed
});

// Delete user
await deleteUser('1');

// Get all users
const users = await getAllUsers();
```

---

## ✅ Testing Checklist

- [ ] Users table created in D1
- [ ] Can see users with `npm run db:users:list`
- [ ] Can login with admin@example.com
- [ ] Can login with user@example.com
- [ ] Session persists after refresh
- [ ] Logout works correctly
- [ ] Invalid credentials show error

---

## 🚀 Next Steps

1. **Add Password Hashing** (bcrypt)
2. **Add User Registration** (if needed)
3. **Add Password Reset** functionality
4. **Add Email Verification** (optional)
5. **Add 2FA** (optional)
6. **Add User Management UI** (CRUD for users)

---

## 🆘 Troubleshooting

### "No user found" error:
- Check users exist: `npm run db:users:list`
- Verify email is correct
- Check D1 credentials in `.env.local`

### "Database not found" error:
- Run: `npm run db:users:setup`
- Check database ID in `wrangler.toml`

### Login not working:
- Restart dev server
- Clear browser cache
- Check console for errors

---

Your authentication is now fully integrated with D1 database! 🎉
