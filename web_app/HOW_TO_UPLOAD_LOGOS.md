# How to Upload Your Custom Logos - Step by Step

## Prerequisites

### 1. Run Database Migration (REQUIRED - Do This First!)

Open your terminal in the `final_cms` folder and run:

```bash
npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql
```

Or use the helper script:
```bash
cd scripts
add-logo-fields.bat
```

**You only need to do this once!**

---

## Step-by-Step Guide

### Step 1: Login as Admin
1. Go to https://dubail-film-maker-website-portfolio.vercel.app/signin
2. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`

### Step 2: Navigate to Settings
1. Click on **"Settings"** in the left sidebar (⚙️ icon)
2. You'll see the Settings page with multiple tabs

### Step 3: Open Logo Settings Tab
1. Click on the **"Logo Settings"** tab (🎨 icon)
2. You'll see three upload sections:
   - Light Mode Logo
   - Dark Mode Logo
   - Icon Logo

### Step 4: Upload Light Mode Logo
1. In the "Light Mode Logo" section:
   - Click the upload area or drag & drop your logo file
   - Supported formats: PNG, JPG, SVG, WebP
   - Recommended size: ~150px wide × 40px tall
   - Use dark colors (for white backgrounds)
2. Wait for upload to complete (you'll see progress)
3. Preview will appear below the upload area

### Step 5: Upload Dark Mode Logo
1. In the "Dark Mode Logo" section:
   - Click the upload area or drag & drop your logo file
   - Supported formats: PNG, JPG, SVG, WebP
   - Recommended size: ~150px wide × 40px tall
   - Use light colors (for dark backgrounds)
2. Wait for upload to complete
3. Preview will appear on dark background

### Step 6: Upload Icon Logo
1. In the "Icon Logo" section:
   - Click the upload area or drag & drop your icon file
   - Supported formats: PNG, JPG, SVG, WebP
   - Recommended size: 32×32px or 64×64px (square)
   - Keep it simple and recognizable
2. Wait for upload to complete
3. Preview will appear at actual size

### Step 7: Save Your Changes
1. Scroll to the bottom
2. Click the blue **"Save Logo Settings"** button
3. Wait for success message
4. Page will automatically reload

### Step 8: Verify Your Logos
After the page reloads, check:
1. **Sidebar** - Your full logo should appear (when expanded)
2. **Collapse sidebar** - Your icon logo should appear
3. **Toggle dark mode** - Your dark logo should appear
4. **Visit /signin** - Your logo should appear on the auth page

---

## Where Your Logos Will Appear

### 1. Sidebar (Expanded)
```
┌─────────────────────┐
│  [Your Full Logo]   │  ← Light/Dark logo here
│                     │
│  📊 Dashboard       │
│  📦 Projects        │
│  👤 Users           │
│  ⚙️  Settings       │
└─────────────────────┘
```

### 2. Sidebar (Collapsed)
```
┌───┐
│ 🎨│  ← Your icon logo here
│   │
│ 📊│
│ 📦│
│ 👤│
│ ⚙️ │
└───┘
```

### 3. Sign In Page
```
┌─────────────────────────────┐
│                             │
│     [Your Full Logo]        │  ← Logo appears here
│                             │
│   Sign In to Your Account   │
│                             │
│   Email: _______________    │
│   Password: ____________    │
│                             │
│   [Sign In Button]          │
└─────────────────────────────┘
```

---

## Tips for Best Results

### Logo Design Tips

**Light Mode Logo:**
- ✅ Use dark colors (black, navy, dark gray)
- ✅ Transparent background
- ✅ High contrast against white
- ❌ Avoid light colors (they won't show on white)

**Dark Mode Logo:**
- ✅ Use light colors (white, light gray, pastels)
- ✅ Transparent background
- ✅ High contrast against dark backgrounds
- ❌ Avoid dark colors (they won't show on dark)

**Icon Logo:**
- ✅ Simple, recognizable design
- ✅ Square or circular shape
- ✅ Works at small sizes (32×32px)
- ✅ Transparent background
- ❌ Avoid complex details (won't be visible when small)

### File Format Recommendations

1. **SVG (Best Choice)**
   - Scales perfectly at any size
   - Small file size
   - Crisp on all displays
   - Recommended for all three logos

2. **PNG (Good Alternative)**
   - Use high resolution (2x or 3x)
   - Transparent background
   - Larger file size than SVG

3. **JPG (Not Recommended)**
   - No transparency support
   - May have white background
   - Use only if no other option

---

## Troubleshooting

### Problem: Upload button doesn't work
**Solution:** 
- Check if you're logged in as admin
- Try refreshing the page
- Check browser console for errors

### Problem: Logo doesn't appear after saving
**Solution:**
- Hard refresh: Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check if upload was successful (look for success toast)
- Verify logo URL in database

### Problem: Logo looks blurry
**Solution:**
- Use higher resolution image (2x or 3x size)
- Use SVG format instead of PNG
- Check original image quality

### Problem: Logo is too big/small
**Solution:**
- Resize your image before uploading
- Recommended dimensions:
  - Full logo: 150px × 40px
  - Icon: 32×32px or 64×64px

### Problem: Can't see dark mode logo
**Solution:**
- Toggle dark mode using the moon icon in header
- Make sure you uploaded a light-colored logo for dark mode
- Check preview in Logo Settings (should show on dark background)

### Problem: Migration fails
**Solution:**
- Make sure you're in the `final_cms` folder
- Check if wrangler is installed: `npx wrangler --version`
- Try running migration manually:
  ```bash
  npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql
  ```

---

## Quick Reference

### URLs
- Settings Page: https://dubail-film-maker-website-portfolio.vercel.app/settings
- Sign In Page: https://dubail-film-maker-website-portfolio.vercel.app/signin

### Admin Credentials
- Email: `admin@example.com`
- Password: `admin123`

### File Limits
- Max file size: 10MB
- Supported formats: PNG, JPG, SVG, WebP, GIF

### Recommended Sizes
- Light/Dark Logo: 150px × 40px
- Icon Logo: 32×32px or 64×64px

---

## Need More Help?

See detailed documentation:
- **Quick Start**: `LOGO_FEATURE_QUICK_START.md`
- **Full Guide**: `LOGO_UPLOAD_FEATURE.md`
- **Technical Details**: `LOGO_UPLOAD_COMPLETE.md`

---

**That's it! You're ready to upload your custom logos! 🎨**
