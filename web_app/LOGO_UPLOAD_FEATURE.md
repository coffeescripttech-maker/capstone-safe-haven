# Logo Upload Feature - Complete Guide

## Overview
Added a comprehensive logo management system that allows admins to upload custom logos that will be used throughout the entire application.

## Features

### 1. Logo Settings Page
- Located in Settings → Logo Settings tab
- Upload three types of logos:
  - **Light Mode Logo**: Full-width logo for light theme
  - **Dark Mode Logo**: Full-width logo for dark theme  
  - **Icon Logo**: Compact square logo for collapsed sidebar

### 2. Dynamic Logo Display
Logos are dynamically loaded from the database and displayed in:
- **Sidebar** (AppSidebar): Shows full logo when expanded, icon when collapsed
- **Sign In Page**: Shows full logo in the auth layout
- **Other Auth Pages**: Signup, reset password, etc.

### 3. Real-time Preview
- Upload interface shows live preview of each logo
- Light mode preview on white background
- Dark mode preview on dark background
- Icon preview at actual size (32x32px)

## Database Changes

### New Fields Added to `header_config` Table
```sql
ALTER TABLE header_config ADD COLUMN logo_light TEXT;
ALTER TABLE header_config ADD COLUMN logo_dark TEXT;
ALTER TABLE header_config ADD COLUMN logo_icon TEXT;
```

### Migration Script
Run this SQL to add the logo fields:
```bash
# For local D1 database
npx wrangler d1 execute DB --local --file=./database/add-logo-fields.sql

# For production D1 database
npx wrangler d1 execute DB --file=./database/add-logo-fields.sql
```

## Files Created

### 1. Components
- `src/components/settings/LogoSettings.tsx` - Logo upload interface
- `src/components/common/AppLogo.tsx` - Reusable logo component

### 2. Database
- `database/add-logo-fields.sql` - Migration script

### 3. Documentation
- `LOGO_UPLOAD_FEATURE.md` - This guide

## Files Modified

### 1. Settings Management
- `src/components/settings/SettingsManagement.tsx`
  - Added "Logo Settings" tab
  - Imported LogoSettings component

### 2. API Routes
- `src/app/api/settings/header/route.ts`
  - Updated PUT endpoint to handle logo fields
  - Dynamic query building for partial updates

### 3. Layout Components
- `src/layout/AppSidebar.tsx`
  - Replaced static Image components with AppLogo
  - Shows full logo when expanded, icon when collapsed
  
- `src/app/(full-width-pages)/(auth)/layout.tsx`
  - Replaced static logo with AppLogo component
  - Updated description text

## How to Use

### For Administrators

1. **Navigate to Settings**
   - Go to https://dubail-film-maker-website-portfolio.vercel.app/settings
   - Click on "Logo Settings" tab

2. **Upload Logos**
   - **Light Mode Logo**: Upload a logo that looks good on white background
   - **Dark Mode Logo**: Upload a logo that looks good on dark background
   - **Icon Logo**: Upload a square icon (recommended 32x32px or larger)

3. **Preview**
   - Each upload shows a preview immediately
   - Light mode preview on white background
   - Dark mode preview on dark background

4. **Save**
   - Click "Save Logo Settings" button
   - Page will reload to apply changes everywhere

5. **Reset**
   - Click "Reset" to discard unsaved changes

### Logo Recommendations

#### Light Mode Logo
- Format: PNG or SVG (SVG preferred for scalability)
- Background: Transparent
- Colors: Dark colors that contrast with white
- Dimensions: Width ~150px, Height ~40px (or proportional)

#### Dark Mode Logo
- Format: PNG or SVG (SVG preferred)
- Background: Transparent
- Colors: Light colors that contrast with dark backgrounds
- Dimensions: Width ~150px, Height ~40px (or proportional)

#### Icon Logo
- Format: PNG or SVG (SVG preferred)
- Background: Transparent
- Shape: Square or circular
- Dimensions: 32x32px minimum (64x64px or 128x128px recommended)
- Design: Simple, recognizable at small sizes

## Technical Details

### AppLogo Component
The `AppLogo` component is a smart component that:
- Fetches logo URLs from the API on mount
- Caches the data to avoid repeated API calls
- Falls back to default logos if API fails
- Supports two variants: "full" and "icon"
- Automatically handles light/dark mode switching
- Shows loading skeleton while fetching

### API Integration
```typescript
// Fetch logos
GET /api/settings/header
Response: {
  logo_light: string | null,
  logo_dark: string | null,
  logo_icon: string | null,
  // ... other header config fields
}

// Update logos
PUT /api/settings/header
Body: {
  logo_light?: string,
  logo_dark?: string,
  logo_icon?: string
}
```

### Storage
- Logos are uploaded to R2 storage in the `branding/logos` folder
- Public URLs are stored in the database
- Original filenames are preserved with timestamp and random string

## Fallback Behavior

If custom logos are not uploaded or API fails:
- Falls back to default logos in `/public/images/logo/`
- Light mode: `/images/logo/logo.svg`
- Dark mode: `/images/logo/logo-dark.svg`
- Icon: `/images/logo/logo-icon.svg`

## Future Enhancements

Potential improvements:
1. **Favicon Upload**: Allow custom favicon upload
2. **Logo Dimensions Validation**: Enforce minimum/maximum dimensions
3. **Image Optimization**: Auto-resize and optimize uploaded logos
4. **Multiple Variants**: Support different logo sizes for different contexts
5. **Logo Preview in Settings**: Show how logo looks in actual sidebar/auth page
6. **Bulk Logo Upload**: Upload all three logos at once
7. **Logo History**: Keep track of previous logos

## Troubleshooting

### Logos Not Updating
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Check if logos were saved successfully (check database)
3. Verify R2 storage is configured correctly
4. Check browser console for errors

### Upload Fails
1. Check file size (max 10MB for images)
2. Verify file format (JPG, PNG, GIF, WebP, SVG)
3. Check R2 credentials in `.env.local`
4. Verify user has admin role

### Logo Not Displaying
1. Check if logo URL is accessible (open in browser)
2. Verify R2 bucket has public access configured
3. Check CORS settings on R2 bucket
4. Inspect network tab for failed requests

## Testing Checklist

- [ ] Upload light mode logo
- [ ] Upload dark mode logo
- [ ] Upload icon logo
- [ ] Verify preview shows correctly
- [ ] Save settings
- [ ] Check sidebar shows new logo (expanded)
- [ ] Check sidebar shows new icon (collapsed)
- [ ] Check signin page shows new logo
- [ ] Toggle dark mode - verify dark logo appears
- [ ] Toggle light mode - verify light logo appears
- [ ] Test with missing logos (should show defaults)
- [ ] Test logo removal
- [ ] Test reset button

## Security Considerations

- Only admin users can upload/modify logos
- File type validation on upload
- File size limits enforced
- Stored in secure R2 bucket
- Public URLs are safe to expose

## Performance

- Logos are cached by browser
- AppLogo component fetches once per page load
- No impact on page load time (async loading)
- Fallback to default logos is instant

## Accessibility

- All logos have proper alt text
- Logos are keyboard accessible (via Link wrapper)
- Dark mode logos ensure proper contrast
- Loading states are announced to screen readers
