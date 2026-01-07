# Fix: Logo Save Error - "Failed to update header config"

## Problem
Upload works successfully, but clicking "Save Logo Settings" returns error:
```json
{"error":"Failed to update header config"}
```

## Root Cause
The database migration was run, but the development server needs to be restarted to recognize the new database schema with the logo fields.

## Solution

### Step 1: Stop Your Development Server
Press `Ctrl+C` in the terminal where `npm run dev` is running.

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Try Saving Again
1. Go to https://dubail-film-maker-website-portfolio.vercel.app/settings
2. Click "Logo Settings" tab
3. Upload your logos (if not already uploaded)
4. Click "Save Logo Settings"
5. Should work now! ✅

## Why This Happens

When you run the database migration while the dev server is running:
1. ✅ Database gets updated with new columns
2. ❌ Server still has old database connection cached
3. ❌ Server tries to update columns that it doesn't know exist
4. ❌ Update fails with generic error

**Solution**: Restart the server to refresh the database connection.

## Verification

After restarting, you should be able to:
- ✅ Upload logos
- ✅ Save logo settings
- ✅ See logos in sidebar
- ✅ See logos on signin page
- ✅ Toggle dark mode and see dark logo

## If Still Not Working

### Check 1: Verify Migration Ran Successfully
```bash
npx wrangler d1 execute DB --local --command "SELECT logo_light, logo_dark, logo_icon FROM header_config WHERE id = 1"
```

Should return the logo columns (even if NULL).

### Check 2: Check Server Logs
Look in your terminal for any error messages when you click "Save Logo Settings".

### Check 3: Check Browser Console
Open browser DevTools (F12) → Console tab → Look for errors when saving.

### Check 4: Verify You're Admin
Make sure you're logged in as admin:
- Email: `admin@example.com`
- Password: `admin123`

### Check 5: Check Network Tab
1. Open DevTools (F12) → Network tab
2. Click "Save Logo Settings"
3. Look for the PUT request to `/api/settings/header`
4. Check the response for detailed error message

## Common Issues

### Issue: "Unauthorized" Error
**Solution**: You're not logged in as admin. Login with admin credentials.

### Issue: Still Getting "Failed to update" After Restart
**Solution**: 
1. Stop dev server
2. Delete `.wrangler` folder
3. Run migration again:
   ```bash
   npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql
   ```
4. Start dev server

### Issue: Migration Says "Already Exists"
**Solution**: That's fine! The columns already exist. Just restart the server.

## Quick Fix Commands

```bash
# Stop server (Ctrl+C)

# Restart server
npm run dev

# If that doesn't work, try:
# 1. Stop server
# 2. Delete cache
rm -rf .wrangler  # or manually delete .wrangler folder

# 3. Run migration again
npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql

# 4. Start server
npm run dev
```

## Success Indicators

You'll know it's working when:
1. ✅ No error when clicking "Save Logo Settings"
2. ✅ Success toast appears: "Logo settings saved successfully!"
3. ✅ Page reloads automatically
4. ✅ Your logos appear in the sidebar
5. ✅ Your logos appear on signin page

---

**TL;DR**: Restart your dev server after running the migration!
