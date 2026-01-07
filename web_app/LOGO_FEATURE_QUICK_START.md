# Logo Upload Feature - Quick Start

## What Was Added

A complete logo management system that allows you to upload custom logos that will replace the default logos throughout your CMS application.

## Quick Setup (3 Steps)

### Step 1: Run Database Migration

**Option A - Using the script (Recommended):**
```bash
cd final_cms/scripts
add-logo-fields.bat
# Choose option 1 for local development
```

**Option B - Manual command:**
```bash
# For local development
npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql

# For production
npx wrangler d1 execute DB --file=./database/add-logo-fields.sql
```

### Step 2: Start Your Development Server
```bash
npm run dev
```

### Step 3: Upload Your Logos
1. Go to https://dubail-film-maker-website-portfolio.vercel.app/settings
2. Click on "Logo Settings" tab (🎨 icon)
3. Upload your three logos:
   - Light Mode Logo (for light theme)
   - Dark Mode Logo (for dark theme)
   - Icon Logo (for collapsed sidebar)
4. Click "Save Logo Settings"
5. Page will reload with your new logos!

## Where Logos Appear

Your uploaded logos will automatically appear in:
- ✅ Sidebar (full logo when expanded, icon when collapsed)
- ✅ Sign In page
- ✅ Sign Up page
- ✅ All auth pages

## Logo Requirements

### Light Mode Logo
- **Best for**: White/light backgrounds
- **Format**: PNG or SVG (SVG recommended)
- **Size**: ~150px wide × 40px tall
- **Colors**: Dark colors for contrast

### Dark Mode Logo
- **Best for**: Dark backgrounds
- **Format**: PNG or SVG (SVG recommended)
- **Size**: ~150px wide × 40px tall
- **Colors**: Light colors for contrast

### Icon Logo
- **Best for**: Collapsed sidebar
- **Format**: PNG or SVG (SVG recommended)
- **Size**: 32×32px minimum (64×64px recommended)
- **Shape**: Square or circular
- **Design**: Simple, recognizable at small size

## Testing Your Logos

After uploading:
1. ✅ Check the sidebar - expand and collapse it
2. ✅ Toggle dark mode (moon icon in header)
3. ✅ Visit /signin page
4. ✅ Refresh the page to ensure logos persist

## Troubleshooting

**Logos not showing?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for errors
- Verify you're logged in as admin

**Upload fails?**
- Check file size (max 10MB)
- Verify file format (PNG, JPG, SVG, WebP)
- Ensure R2 storage is configured

**Need help?**
- See full documentation: `LOGO_UPLOAD_FEATURE.md`
- Check database migration: `database/add-logo-fields.sql`

## Files Added/Modified

**New Files:**
- `src/components/settings/LogoSettings.tsx` - Upload interface
- `src/components/common/AppLogo.tsx` - Dynamic logo component
- `database/add-logo-fields.sql` - Database migration
- `scripts/add-logo-fields.bat` - Migration helper script

**Modified Files:**
- `src/components/settings/SettingsManagement.tsx` - Added logo tab
- `src/app/api/settings/header/route.ts` - Added logo fields support
- `src/layout/AppSidebar.tsx` - Uses dynamic logo
- `src/app/(full-width-pages)/(auth)/layout.tsx` - Uses dynamic logo

## Next Steps

1. Run the database migration
2. Upload your logos
3. Enjoy your branded CMS!

That's it! Your custom logos will now appear throughout the application. 🎉
