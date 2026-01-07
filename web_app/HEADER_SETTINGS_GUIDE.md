# Header Settings Guide

## Overview
The Header Settings feature allows you to configure your portfolio website's header layout and logos through the CMS.

## Features

### 1. **Preset Selection**
Choose from three header layout presets:

- **Default Layout**: Logo left, menu right - optimized for horizontal logo
- **Reversed Layout**: Logo right, menu left - comprehensive layout
- **Stacked Logo**: Optimized for tall stacked logo

### 2. **Logo Upload for Each Preset**
Upload a different logo for each preset. The active preset's logo will be displayed on your portfolio website.

### 3. **Database Storage**
All configuration is stored in the `header_config` table:
- `active_preset`: Currently active preset (default, reversed, stackedLogo)
- `logo_default`: Logo URL for default preset
- `logo_reversed`: Logo URL for reversed preset
- `logo_stacked`: Logo URL for stacked logo preset
- `config_json`: Additional custom configuration

## Setup Instructions

### Step 1: Run Database Migration
```bash
cd final_cms
wrangler d1 execute portfolio-cms-db --local --file=database/update-header-config.sql
```

For remote database:
```bash
wrangler d1 execute portfolio-cms-db --remote --file=database/update-header-config.sql
```

### Step 2: Access Header Settings
1. Log in to your CMS at `http://localhost:3000`
2. Navigate to **Settings** page
3. Click on the **Header** tab

### Step 3: Configure Header
1. **Select Active Preset**: Choose which layout to use on your website
2. **Upload Logos**: Upload a logo for each preset
   - Click "Upload Logo" button for each preset
   - Select an image file (SVG, PNG, JPG recommended)
   - Logo will be uploaded to R2 storage
3. **Save Changes**: Click "Save Changes" button

## API Endpoints

### Internal API (CMS - Requires Auth)
**GET** `/api/settings/header`
- Fetches header configuration for admin panel

**PUT** `/api/settings/header`
- Updates header configuration
- Body: `{ active_preset, logo_default, logo_reversed, logo_stacked, config_json }`

### Public API (Portfolio Website - No Auth)
**GET** `/api/public/header`
- Returns header configuration for portfolio website
- Includes active preset and all preset configurations
- Logos are automatically injected from database

## Response Structure

```json
{
  "activePreset": "default",
  "description": "Header configuration...",
  "presets": {
    "default": {
      "name": "Default Layout",
      "description": "Logo left, menu right...",
      "logo": {
        "src": "https://your-r2-url.com/logos/logo.svg",
        "alt": "DubaiFilmMaker"
      },
      "mobile": { ... },
      "desktop": { ... },
      "extraLarge": { ... }
    },
    "reversed": { ... },
    "stackedLogo": { ... }
  }
}
```

## How It Works

1. **CMS Admin** uploads logos and selects active preset in Settings
2. **Database** stores the configuration and logo URLs
3. **Public API** reads from database and returns configuration
4. **Portfolio Website** fetches configuration and applies it
5. **Active preset's logo** is displayed on the website

## Portfolio Website Integration

Your portfolio website's `data-loader.js` automatically fetches from:
```javascript
const headerConfig = await fetch('https://dubail-film-maker-website-portfolio.vercel.app/api/public/header');
```

The configuration is then applied by `site-config.js` to style the header and display the correct logo.

## Troubleshooting

### Logo not showing?
1. Check if logo was uploaded successfully (should see preview in CMS)
2. Verify R2 storage is configured correctly
3. Check browser console for errors
4. Test the public API: `https://dubail-film-maker-website-portfolio.vercel.app/api/public/header`

### Preset not applying?
1. Make sure you clicked "Save Changes" after selecting preset
2. Clear your portfolio website cache
3. Refresh the portfolio website page

### Upload failing?
1. Check R2 credentials in `.env.local`
2. Verify file is an image (SVG, PNG, JPG)
3. Check file size (should be reasonable for web)

## Database Schema

```sql
CREATE TABLE header_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_preset TEXT DEFAULT 'default',
  config_json TEXT DEFAULT '{}',
  logo_default TEXT,
  logo_reversed TEXT,
  logo_stacked TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

1. **Use SVG for logos** - They scale perfectly at any size
2. **Optimize images** - Keep file sizes small for fast loading
3. **Test each preset** - Switch between presets to see how they look
4. **Consistent branding** - Use similar logos across presets for consistency
5. **Mobile-friendly** - Ensure logos look good on mobile devices

## Advanced Configuration

You can add custom configuration in the JSON field for advanced styling:

```json
{
  "customStyles": {
    "headerBackground": "#ffffff",
    "logoMaxWidth": "200px"
  }
}
```

This will be merged with the preset configuration and available in the public API response.
