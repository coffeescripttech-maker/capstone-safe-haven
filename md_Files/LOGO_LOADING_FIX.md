# Logo Not Loading - Troubleshooting Guide

## Issue
The `my_logo.jpg` is not displaying in the UI even though the file exists.

## Common Causes & Solutions

### 1. Next.js Cache Issue (Most Common)
Next.js caches images and components. When you change image paths, you need to clear the cache.

**Solution:**
```powershell
cd web_app
.\fix-logo-loading.ps1
```

Or manually:
```powershell
cd web_app
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run dev
```

### 2. Browser Cache
Your browser might be caching the old logo.

**Solution:**
- **Chrome/Edge**: Press `Ctrl + Shift + R` (hard refresh)
- **Firefox**: Press `Ctrl + F5`
- Or open DevTools (F12) → Network tab → Check "Disable cache"

### 3. Development Server Not Restarted
Changes to public files sometimes require a server restart.

**Solution:**
```powershell
# Stop the server (Ctrl + C)
# Then restart:
npm run dev
```

### 4. File Path Issues
Make sure the file is in the correct location.

**Check:**
- File location: `web_app/public/images/logo/my_logo.jpg`
- Path in code: `/images/logo/my_logo.jpg` (no "public" prefix)

### 5. Image Optimization Issues
Next.js Image component might have issues with certain JPG files.

**Current Fix Applied:**
- Added `unoptimized` prop to bypass Next.js image optimization
- This forces the browser to load the image directly

## What We Changed

### AppLogo Component (`web_app/src/components/common/AppLogo.tsx`)

```tsx
// Before
<Image src="/images/logo/WEBSITE_LOGO.png" ... />

// After
<Image 
  src="/images/logo/my_logo.jpg"
  unoptimized  // ← Added this to bypass optimization
  ...
/>
```

## Step-by-Step Fix

1. **Run the fix script:**
   ```powershell
   cd web_app
   .\fix-logo-loading.ps1
   ```

2. **Restart dev server:**
   ```powershell
   npm run dev
   ```

3. **Hard refresh browser:**
   - Press `Ctrl + Shift + R`

4. **Check browser console:**
   - Press `F12`
   - Look for any 404 errors or image loading errors
   - If you see errors, share them for further help

## Verify Logo File

Run this to check if the file exists:
```powershell
cd web_app
Test-Path public/images/logo/my_logo.jpg
# Should return: True
```

Check file size:
```powershell
(Get-Item public/images/logo/my_logo.jpg).Length
# Should show file size in bytes
```

## Still Not Working?

### Check Browser DevTools
1. Press `F12` to open DevTools
2. Go to **Network** tab
3. Refresh the page
4. Look for `my_logo.jpg` in the list
5. Check its status:
   - **200**: File loaded successfully (but might not be displaying due to CSS)
   - **404**: File not found (path issue)
   - **Failed**: Network or server issue

### Check Console Errors
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for any red error messages
4. Common errors:
   - "Failed to load resource" → Path issue
   - "Image optimization error" → Try `unoptimized` prop (already added)

### Alternative: Use Regular img Tag
If Next.js Image component continues to have issues:

```tsx
// Temporary workaround
<img 
  src="/images/logo/my_logo.jpg" 
  alt="SafeHaven"
  width={36}
  height={36}
  className="object-contain"
/>
```

## Current Implementation

The logo is now configured to use `my_logo.jpg` with:
- ✅ Correct file path: `/images/logo/my_logo.jpg`
- ✅ `unoptimized` prop to bypass Next.js optimization
- ✅ `priority` prop for faster loading
- ✅ White background container for visibility on dark sidebar
- ✅ Proper sizing and object-fit

## Need More Help?

If the logo still doesn't load after trying all these steps:
1. Share the browser console errors (F12 → Console tab)
2. Share the Network tab status for my_logo.jpg
3. Verify the file isn't corrupted (try opening it in an image viewer)
