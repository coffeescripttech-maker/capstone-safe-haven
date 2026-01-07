# ⚙️ Settings Management System - Complete Guide

## ✅ What's Been Created

A complete **Settings Management System** with tabbed interface for managing About Content, Contact Info, and Header Configuration.

---

## 🎯 Features

### Settings Page (`/settings`)
- ✅ **Admin-only access** - Only administrators can manage settings
- ✅ **Tabbed interface** - Easy navigation between settings sections
- ✅ **About Content** - Manage founder info, company description, video
- ✅ **Contact Info** - Manage email, phone, address, social media
- ✅ **Header Config** - Manage header presets and custom JSON configuration
- ✅ **Auto-save timestamps** - Track when settings were last updated

---

## 📁 Files Created

### Pages:
1. **`src/app/(admin)/(others-pages)/settings/page.tsx`**
   - Settings management page
   - Admin-only access check

### Components:
2. **`src/components/settings/SettingsManagement.tsx`**
   - Main component with tabbed interface
   - Manages active tab state

3. **`src/components/settings/AboutSettings.tsx`**
   - About content form
   - Founder information
   - Company description
   - Video section

4. **`src/components/settings/ContactSettings.tsx`**
   - Contact information form
   - Email and phone
   - Address
   - Social media links

5. **`src/components/settings/HeaderSettings.tsx`**
   - Header configuration form
   - Preset selection
   - Custom JSON editor
   - JSON validation and formatting

### API Routes:
6. **`src/app/api/settings/about/route.ts`**
   - GET: Fetch about content
   - PUT: Update about content

7. **`src/app/api/settings/contact/route.ts`**
   - GET: Fetch contact info
   - PUT: Update contact info

8. **`src/app/api/settings/header/route.ts`**
   - GET: Fetch header config
   - PUT: Update header config

### Navigation:
9. **`src/layout/AppSidebar.tsx`** (Updated)
   - Added "Settings" menu item

---

## 🎨 User Interface

### Tabbed Interface
```
┌─────────────────────────────────────────────────┐
│  📝 About Content  📞 Contact Info  ⚙️ Header   │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Active Tab Content]                           │
│                                                 │
│  [Save Changes Button]                          │
└─────────────────────────────────────────────────┘
```

---

## 📝 About Content Tab

### Fields:

**Founder Information:**
- Founder Name
- Founder Title
- Founder Bio (HTML supported)

**Company Information:**
- Company Description (HTML supported)

**Video Section:**
- Video Button Text
- Video URL

### Database Table: `about_content`
```sql
CREATE TABLE about_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  founder_name TEXT,
  founder_title TEXT,
  founder_bio TEXT,
  company_description TEXT,
  video_button_text TEXT,
  video_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Example Data:
```json
{
  "founder_name": "Ahmed Al Mutawa",
  "founder_title": "FILM DIRECTOR / EXECUTIVE PRODUCER",
  "founder_bio": "Emirati award-winning filmmaker...",
  "company_description": "Located in the heart of Dubai...",
  "video_button_text": "view DubaiFilmMaker reel 2025",
  "video_url": "https://video.wixstatic.com/video/..."
}
```

---

## 📞 Contact Info Tab

### Fields:

**Contact Details:**
- Email Address
- Phone Number

**Address:**
- City
- Street Address (Optional)

**Social Media:**
- Vimeo URL
- Instagram URL

### Database Table: `contact_info`
```sql
CREATE TABLE contact_info (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email TEXT,
  phone TEXT,
  city TEXT,
  street TEXT,
  vimeo_url TEXT,
  instagram_url TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Example Data:
```json
{
  "email": "hello@dubaifilmmaker.ae",
  "phone": "+971 50 969 9683",
  "city": "Dubai, UAE",
  "street": "",
  "vimeo_url": "https://vimeo.com/dubaifilmmaker",
  "instagram_url": "https://www.instagram.com/dubaifilmmaker/"
}
```

---

## ⚙️ Header Config Tab

### Fields:

**Header Preset:**
- Default
- Minimal
- Full Width
- Custom

**Custom Configuration (JSON):**
- JSON editor with syntax highlighting
- Format JSON button
- Real-time validation
- Preview of parsed configuration

### Database Table: `header_config`
```sql
CREATE TABLE header_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active_preset TEXT DEFAULT 'default',
  config_json TEXT DEFAULT '{}',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Example Configurations:

**Logo Settings:**
```json
{
  "logo": {
    "url": "/logo.png",
    "height": 40
  }
}
```

**Navigation:**
```json
{
  "nav": {
    "position": "center",
    "sticky": true
  }
}
```

**Colors:**
```json
{
  "colors": {
    "bg": "#ffffff",
    "text": "#000000"
  }
}
```

**Complete Example:**
```json
{
  "logo": {
    "url": "/logo.png",
    "height": 40
  },
  "nav": {
    "position": "center",
    "sticky": true,
    "items": ["Home", "About", "Projects", "Contact"]
  },
  "colors": {
    "bg": "#ffffff",
    "text": "#000000",
    "accent": "#0066cc"
  },
  "layout": {
    "maxWidth": "1200px",
    "padding": "20px"
  }
}
```

---

## 📊 API Endpoints

### About Content

**GET `/api/settings/about`**
- Fetch about content
- Authentication: Required
- Response: About content object

**PUT `/api/settings/about`**
- Update about content
- Authentication: Required (Admin only)
- Request Body: About content fields
- Response: Updated about content

### Contact Info

**GET `/api/settings/contact`**
- Fetch contact info
- Authentication: Required
- Response: Contact info object

**PUT `/api/settings/contact`**
- Update contact info
- Authentication: Required (Admin only)
- Request Body: Contact info fields
- Response: Updated contact info

### Header Config

**GET `/api/settings/header`**
- Fetch header config
- Authentication: Required
- Response: Header config object

**PUT `/api/settings/header`**
- Update header config
- Authentication: Required (Admin only)
- Request Body: Header config fields
- Validation: JSON format check
- Response: Updated header config

---

## 🔐 Security & Authorization

### Access Control:
- ✅ **Admin-only page** - Only admins can access `/settings`
- ✅ **Protected API routes** - All settings APIs require admin role
- ✅ **Read access** - All authenticated users can read settings
- ✅ **Write access** - Only admins can update settings

### Data Validation:
- ✅ **JSON validation** - Header config JSON is validated before save
- ✅ **URL validation** - Video and social media URLs
- ✅ **Email validation** - Contact email format
- ✅ **Phone validation** - Contact phone format

---

## 🔄 Data Flow

```
1. Admin navigates to /settings
   ↓
2. Page checks admin role
   ↓
3. SettingsManagement loads with tabs
   ↓
4. Active tab component fetches data from API
   ↓
5. Data displayed in form
   ↓
6. Admin edits fields
   ↓
7. On submit: API validates and updates
   ↓
8. Database updated with new values
   ↓
9. Updated_at timestamp auto-updated
   ↓
10. Toast notification shown
   ↓
11. Form refreshes with saved data
```

---

## 🧪 Testing Guide

### Test Settings Access:

1. **As Admin:**
   ```
   Login: admin@example.com / admin123
   Navigate to: /settings
   Expected: See settings page with tabs
   ```

2. **As Regular User:**
   ```
   Login: user@example.com / user123
   Navigate to: /settings
   Expected: Redirected to /unauthorized
   ```

### Test About Content:

1. Navigate to About Content tab
2. Update founder name: "Test Founder"
3. Update founder bio with HTML: "Test bio<br />New line"
4. Click "Save Changes"
5. Expected: Success toast, data saved

### Test Contact Info:

1. Navigate to Contact Info tab
2. Update email: "test@example.com"
3. Update phone: "+971 50 123 4567"
4. Update social media URLs
5. Click "Save Changes"
6. Expected: Success toast, data saved

### Test Header Config:

1. Navigate to Header Config tab
2. Select preset: "Minimal"
3. Update JSON:
   ```json
   {
     "logo": {
       "url": "/logo.png"
     }
   }
   ```
4. Click "Format JSON" to validate
5. Click "Save Changes"
6. Expected: Success toast, JSON saved

### Test JSON Validation:

1. Enter invalid JSON: `{invalid}`
2. Click "Save Changes"
3. Expected: Error "Invalid JSON format"

---

## 💡 Usage Examples

### Update Founder Information:
```typescript
PUT /api/settings/about
{
  "founder_name": "John Doe",
  "founder_title": "CEO & Founder",
  "founder_bio": "Experienced filmmaker with 20+ years..."
}
```

### Update Contact Email:
```typescript
PUT /api/settings/contact
{
  "email": "contact@newdomain.com",
  "phone": "+971 50 123 4567"
}
```

### Update Header Preset:
```typescript
PUT /api/settings/header
{
  "active_preset": "minimal",
  "config_json": "{\"logo\": {\"height\": 50}}"
}
```

---

## 🎨 UI Features

### Tabbed Navigation:
- Clean tab interface
- Active tab highlighting
- Icon indicators
- Smooth transitions

### Form Sections:
- Grouped by category
- Clear labels
- Helper text
- Responsive layout

### JSON Editor:
- Syntax highlighting (monospace font)
- Format button
- Real-time validation
- Preview of parsed JSON
- Example configurations

### Visual Feedback:
- Loading states
- Save button states
- Toast notifications
- Last updated timestamps

---

## ⚠️ Important Notes

### Single Row Tables:
- All settings tables have only ONE row (id = 1)
- Updates modify the existing row
- No create/delete operations needed

### HTML Support:
- Founder bio and company description support HTML
- Use `<br />` for line breaks
- Be careful with HTML injection

### JSON Configuration:
- Must be valid JSON format
- Validated before saving
- Use Format button to check syntax
- Examples provided in UI

### Auto-Timestamps:
- `updated_at` automatically updated on save
- Displayed in UI for reference
- Useful for tracking changes

---

## 🚀 Next Steps (Optional)

### Rich Text Editor:
- Replace textarea with WYSIWYG editor
- Better HTML editing experience
- Preview mode

### Image Upload:
- Add logo upload for header
- Founder photo upload
- Company images

### Backup/Restore:
- Export settings to JSON file
- Import settings from backup
- Version history

### Preview Mode:
- Live preview of changes
- Before/after comparison
- Test configurations

---

## ✅ Summary

Your Settings Management System is now complete with:
- ✅ Tabbed interface for easy navigation
- ✅ About content management
- ✅ Contact information management
- ✅ Header configuration with JSON editor
- ✅ Admin-only access control
- ✅ Real-time validation
- ✅ Toast notifications
- ✅ Auto-save timestamps
- ✅ Responsive design
- ✅ Dark mode support

**Access at:** https://dubail-film-maker-website-portfolio.vercel.app/settings (Admin only)

**Your CMS now has complete settings management!** 🎉
