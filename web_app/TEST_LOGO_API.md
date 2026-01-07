# Test Logo API

## Quick Test

Open your browser console (F12) and run:

```javascript
fetch('/api/settings/logo')
  .then(r => r.json())
  .then(data => console.log('Logo data:', data));
```

## Expected Response

You should see something like:
```json
{
  "id": 1,
  "logo_light": "https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev/branding/logos/...",
  "logo_dark": "/images/logo/logo-dark.svg",
  "logo_icon": "/images/logo/logo-icon.svg",
  "updated_at": "2024-12-18..."
}
```

## Troubleshooting

### If you see default logos instead of your uploaded ones:

1. **Check if save was successful**:
   - Go to Settings → Logo Settings
   - Check if your uploaded logo shows in the preview
   - Try saving again

2. **Hard refresh the page**:
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - This clears the cache

3. **Check browser console**:
   - Press F12
   - Look for any errors
   - Look for "Fetched logo data:" log message

4. **Verify database**:
   ```bash
   npx wrangler d1 execute DB --remote --command "SELECT * FROM logo_settings"
   ```

### If logos still don't show:

1. **Clear browser cache completely**
2. **Try incognito/private window**
3. **Check if the logo URL is accessible** (paste it in browser)
4. **Restart dev server** (Ctrl+C, then npm run dev)

## Debug Steps

1. Open browser console (F12)
2. Go to http://localhost:3000
3. Look for console log: "Fetched logo data: ..."
4. Check if the URLs are correct
5. Try opening the logo URL directly in browser

If the URL works but logo doesn't show, it might be a CORS or caching issue.
