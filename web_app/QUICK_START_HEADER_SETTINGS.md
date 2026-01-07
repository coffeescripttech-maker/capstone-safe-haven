# Quick Start: Header Settings

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration
```bash
cd final_cms
wrangler d1 execute portfolio-cms-db --local --file=database/update-header-config.sql
```

### Step 2: Access Header Settings
1. Go to http://localhost:3000
2. Login to CMS
3. Click **Settings** → **Header** tab

### Step 3: Configure Your Header
1. **Select Active Preset:**
   - Default Layout (logo left, menu right)
   - Reversed Layout (logo right, menu left)
   - Stacked Logo (for tall logos)

2. **Upload Logos:**
   - Click "Upload Logo" for each preset
   - Choose your logo file (SVG recommended)
   - Logo uploads to R2 storage automatically

3. **Save Changes**

## ✅ How Portfolio Website Gets the Data

### Automatic Integration
Your portfolio website is already configured to fetch from the CMS!

**File:** `final_portfolio_website/assets/js/data-loader.js`
```javascript
const API_CONFIG = {
  USE_CMS_API: true,
  CMS_BASE_URL: 'http://localhost:3000/api/public'
};
```

**File:** `final_portfolio_website/assets/js/site-config.js`
```javascript
async function loadHeaderConfig() {
  // Fetches from CMS API automatically
  headerConfig = await window.fetchHeader();
}
```

### Data Flow
```
CMS Database → Public API → Portfolio Website
     ↓              ↓              ↓
  Stores        Returns        Displays
   logos        config          logo
```

### What Happens:
1. You upload logo in CMS Settings
2. Logo saved to R2 storage
3. URL saved to database
4. Public API returns configuration
5. Portfolio website fetches and displays logo

## 🧪 Test It

### 1. Test CMS API
Open in browser:
```
https://dubail-film-maker-website-portfolio.vercel.app/api/public/header
```

Should return:
```json
{
  "activePreset": "default",
  "presets": {
    "default": {
      "logo": {
        "src": "https://your-r2-url.com/logos/logo.svg",
        "alt": "DubaiFilmMaker"
      },
      ...
    }
  }
}
```

### 2. Check Portfolio Website
1. Open portfolio website
2. Open browser console (F12)
3. Look for:
   ```
   ✓ Header config loaded from CMS API
   ```

### 3. Verify Logo Displays
- Logo should appear in header
- Should match the active preset you selected
- Should be the logo you uploaded

## 📋 Available Presets

### Default Layout
- Logo: Left side
- Menu: Right side
- Best for: Horizontal logos
- Mobile: Logo scales to fit

### Reversed Layout
- Logo: Right side
- Menu: Left side
- Best for: Alternative layout
- Mobile: Reversed order maintained

### Stacked Logo
- Logo: Left side (taller)
- Menu: Right side
- Best for: Vertical/stacked logos
- Mobile: More height allowed

## 🎨 Logo Recommendations

- **Format:** SVG (scales perfectly)
- **Fallback:** PNG with transparent background
- **Size:** Optimized for web (< 100KB)
- **Dimensions:** 
  - Horizontal: ~200-300px wide
  - Stacked: ~100-150px wide, taller height

## 🔄 Update Process

### To Change Logo:
1. Go to CMS Settings → Header
2. Find the preset you want to update
3. Click "Change Logo"
4. Select new file
5. Click "Save Changes"
6. Refresh portfolio website

### To Change Active Preset:
1. Go to CMS Settings → Header
2. Select different preset from dropdown
3. Click "Save Changes"
4. Refresh portfolio website
5. New layout applies immediately

## 🐛 Troubleshooting

### Logo not showing?
```bash
# Check if API returns logo URL
curl https://dubail-film-maker-website-portfolio.vercel.app/api/public/header

# Check browser console for errors
# Open DevTools → Console tab
```

### Upload failing?
- Check R2 credentials in `.env.local`
- Verify file is an image
- Check file size (should be reasonable)

### Changes not appearing?
- Clear browser cache (Ctrl+Shift+R)
- Check if you clicked "Save Changes"
- Verify CMS is running

## 📚 More Information

- **Full Guide:** `HEADER_SETTINGS_GUIDE.md`
- **Integration Details:** `../final_portfolio_website/CMS_INTEGRATION_GUIDE.md`
- **Public APIs:** `PUBLIC_API_ENDPOINTS.md`

## ✨ That's It!

Your header settings are now fully integrated with the CMS. Any changes you make in the CMS will automatically appear on your portfolio website!
