# Why Your Logos Aren't Showing - Troubleshooting Guide

## Quick Fixes (Try These First!)

### 1. Hard Refresh Your Browser
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```
This clears the cached version of the page.

### 2. Check Browser Console
1. Press `F12` to open DevTools
2. Go to Console tab
3. Look for: `"Fetched logo data:"` message
4. Check if your logo URLs are there

### 3. Test the API Directly
Open browser console (F12) and run:
```javascript
fetch('/api/settings/logo')
  .then(r => r.json())
  .then(data => console.log(data));
```

Expected output:
```json
{
  "logo_light": "https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev/...",
  "logo_dark": "/images/logo/logo-dark.svg",
  "logo_icon": "/images/logo/logo-icon.svg"
}
```

## Common Issues

### Issue 1: Browser Cache
**Symptom**: Saved logos but still seeing old ones
**Solution**: 
- Hard refresh (Ctrl+Shift+R)
- Or try incognito/private window
- Or clear browser cache completely

### Issue 2: Component Not Re-rendering
**Symptom**: API returns correct data but logo doesn't update
**Solution**:
- The page should auto-reload after saving
- If not, manually refresh the page
- Check if you're on the right page (not cached)

### Issue 3: SVG Not Loading
**Symptom**: SVG logo uploaded but shows broken image
**Solution**:
- SVG support was just added
- Make sure you restarted dev server after adding SVG support
- Try uploading PNG instead to test

### Issue 4: CORS or Security Issues
**Symptom**: Logo URL works in browser but not in app
**Solution**:
- Check browser console for CORS errors
- R2 bucket should allow public access
- Try using regular `<img>` tag (already implemented)

## Verification Steps

### Step 1: Verify Upload
1. Go to Settings → Logo Settings
2. Check if preview shows your logo
3. If not, upload again

### Step 2: Verify Save
1. Click "Save Logo Settings"
2. Wait for success message
3. Page should reload automatically

### Step 3: Verify API
Run in browser console:
```javascript
fetch('/api/settings/logo').then(r => r.json()).then(console.log)
```

### Step 4: Verify Display
1. Go to http://localhost:3000
2. Check sidebar logo
3. Go to https://dubail-film-maker-website-portfolio.vercel.app/signin
4. Check auth page logo

### Step 5: Check Database
```bash
npx wrangler d1 execute DB --remote --command "SELECT * FROM logo_settings"
```

Should show your logo URLs.

## Debug Checklist

- [ ] Uploaded logo successfully
- [ ] Clicked "Save Logo Settings"
- [ ] Saw success message
- [ ] Page reloaded automatically
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked browser console for errors
- [ ] Tested API endpoint (returns correct data)
- [ ] Verified logo URL works (paste in browser)
- [ ] Restarted dev server
- [ ] Tried incognito window

## Still Not Working?

### Check These:

1. **Is the logo URL accessible?**
   - Copy the logo URL from API response
   - Paste it in browser address bar
   - Should show your logo

2. **Is AppLogo component being used?**
   - Check AppSidebar.tsx
   - Check auth layout
   - Should see `<AppLogo />` component

3. **Are there console errors?**
   - Open F12 → Console
   - Look for red error messages
   - Share the error for help

4. **Is the database updated?**
   ```bash
   npx wrangler d1 execute DB --remote --command "SELECT * FROM logo_settings"
   ```

## Expected Behavior

After saving logos:
1. ✅ Success toast appears
2. ✅ Page reloads automatically
3. ✅ Sidebar shows new logo
4. ✅ Signin page shows new logo
5. ✅ Dark mode shows dark logo

## Files to Check

If logos still don't show, check these files:
- `src/components/common/AppLogo.tsx` - Logo component
- `src/layout/AppSidebar.tsx` - Should use AppLogo
- `src/app/(full-width-pages)/(auth)/layout.tsx` - Should use AppLogo
- `src/app/api/settings/logo/route.ts` - API endpoint

---

**Most Common Fix**: Hard refresh (Ctrl+Shift+R) after saving!
