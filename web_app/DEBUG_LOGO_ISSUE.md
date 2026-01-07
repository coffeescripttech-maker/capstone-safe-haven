# Debug: Logo Not Showing on Signin Page

## What We Know

✅ API is working: `/api/settings/logo` returns correct data
✅ Logo URL exists: `https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev/branding/logos/dubaifilmmaker-light-1766023620548-4vp537t95ya.svg`
✅ AppLogo component is in the auth layout
✅ Console shows: "Fetched logo data: ..."

## Possible Issues

### 1. SVG CORS Issue
SVG files from R2 might have CORS restrictions.

**Test**: Open this URL directly in browser:
```
https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev/branding/logos/dubaifilmmaker-light-1766023620548-4vp537t95ya.svg
```

If it shows your logo, CORS is fine. If not, R2 bucket needs CORS configuration.

### 2. Component Not Rendering
The AppLogo might be rendering but the image isn't loading.

**Check**: 
1. Open signin page
2. Press F12 → Elements tab
3. Search for "AppLogo" or look for `<img>` tags
4. See if the img tag has the correct src attribute

### 3. CSS/Styling Issue
The logo might be there but hidden by CSS.

**Check**:
1. Inspect the logo element
2. Check if it has `display: none` or `visibility: hidden`
3. Check if width/height is 0

### 4. Loading State Stuck
The component might be stuck in loading state.

**Check**: Look for the loading skeleton (gray pulsing box)

## Quick Fixes to Try

### Fix 1: Force Reload Component
Add a key to force re-render:

In `auth/layout.tsx`, change:
```tsx
<AppLogo variant="full" href="/" />
```
to:
```tsx
<AppLogo variant="full" href="/" key={Date.now()} />
```

### Fix 2: Use PNG Instead of SVG
Upload a PNG version of your logo to test if it's an SVG issue.

### Fix 3: Check R2 Bucket CORS
Your R2 bucket might need CORS configuration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["*"]
  }
]
```

### Fix 4: Add Error Handling
Check browser console for any errors when loading the image.

## Debug Steps

### Step 1: Check if Image Tag Exists
1. Go to https://dubail-film-maker-website-portfolio.vercel.app/signin
2. Press F12
3. Go to Elements tab
4. Press Ctrl+F and search for "dubaifilmmaker-light"
5. Do you see an `<img>` tag with that src?

### Step 2: Check Network Tab
1. Press F12 → Network tab
2. Reload page
3. Look for the logo file request
4. Check if it's:
   - ✅ Status 200 (success)
   - ❌ Status 403 (forbidden - CORS issue)
   - ❌ Status 404 (not found)
   - ❌ Failed (network error)

### Step 3: Check Console
1. Press F12 → Console tab
2. Look for any errors related to:
   - CORS
   - Failed to load image
   - AppLogo component

### Step 4: Inspect Element
1. Right-click where logo should be
2. Click "Inspect"
3. Check if the img element is there
4. Check its computed styles

## Expected HTML

You should see something like:
```html
<a href="/">
  <img 
    src="https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev/branding/logos/dubaifilmmaker-light-1766023620548-4vp537t95ya.svg"
    alt="Logo"
    style="height: 40px; width: auto;"
    class="dark:hidden"
  />
</a>
```

## What to Check Next

1. **Is the img tag in the DOM?** (Elements tab)
2. **Does the img tag have the correct src?** (Should be your R2 URL)
3. **Is there a network request for the logo?** (Network tab)
4. **What's the status of that request?** (200, 403, 404?)
5. **Are there any console errors?** (Console tab)

## Report Back

Please check these and let me know:
- [ ] Can you see the img tag in Elements tab?
- [ ] What's the src attribute value?
- [ ] Is there a network request for the logo?
- [ ] What's the status code of that request?
- [ ] Any console errors?

This will help me identify the exact issue!
