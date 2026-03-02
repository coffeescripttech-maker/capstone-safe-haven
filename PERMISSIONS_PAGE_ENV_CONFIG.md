# Permissions Page - Environment Configuration

## ✅ COMPLETED

The Permissions Management page has been updated to use environment variables instead of hardcoded URLs, making it production-ready.

## Changes Made

### 1. Updated Permissions Page Component
**File**: `MOBILE_APP/web_app/src/app/(admin)/permissions/page.tsx`

- Added `API_URL` constant that reads from `process.env.NEXT_PUBLIC_API_URL`
- Automatically strips `/api/v1` suffix if present (for flexibility)
- Falls back to `http://localhost:3001` for local development
- Updated all 4 fetch calls to use the environment variable:
  - `loadPermissions()` - GET permissions
  - `loadAuditLogs()` - GET audit history
  - `handleAddPermission()` - POST new permission
  - `handleRemovePermission()` - DELETE permission

### 2. Updated Environment Configuration
**File**: `MOBILE_APP/web_app/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## How It Works

The code now constructs API URLs like this:

```typescript
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
  .replace(/\/api\/v1$/, '');

// Results in:
// http://localhost:3001/api/v1/admin/permissions
```

## Production Deployment

### For Production Environment

1. Set the environment variable in your production environment:

```env
NEXT_PUBLIC_API_URL=https://api.safehaven.com
```

2. The app will automatically use this URL for all API calls

### For Different Environments

**Development** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Staging** (`.env.staging`):
```env
NEXT_PUBLIC_API_URL=https://staging-api.safehaven.com
```

**Production** (`.env.production`):
```env
NEXT_PUBLIC_API_URL=https://api.safehaven.com
```

## Testing

1. **Start the backend server**:
```bash
cd MOBILE_APP/backend
npm run dev
```

2. **Start the web app**:
```bash
cd MOBILE_APP/web_app
npm run dev
```

3. **Login as super admin**:
   - Email: `superadmin@test.safehaven.com`
   - Password: `Test123!`

4. **Navigate to Permissions page**:
   - Go to: http://localhost:3000/permissions
   - Verify permissions load correctly
   - Test adding/removing permissions
   - Check audit history

## Benefits

✅ **Production Ready**: No hardcoded URLs  
✅ **Environment Flexible**: Easy to switch between dev/staging/prod  
✅ **Maintainable**: Single source of truth for API URL  
✅ **Secure**: API URL can be different per environment  
✅ **Scalable**: Easy to update when API location changes

## Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- Environment variables are read at build time, so restart the dev server after changes
- For production builds, set the variable in your hosting platform (Vercel, Netlify, etc.)
- The code handles both formats: `http://localhost:3001` and `http://localhost:3001/api/v1`

## Related Files

- `MOBILE_APP/web_app/src/app/(admin)/permissions/page.tsx` - Permissions page component
- `MOBILE_APP/web_app/.env.local` - Local environment configuration
- `MOBILE_APP/backend/src/controllers/admin.controller.ts` - Backend API controller
- `MOBILE_APP/PERMISSIONS_PAGE_WORKING.md` - Previous fix documentation
