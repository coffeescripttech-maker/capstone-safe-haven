# Public API Endpoints

All public API endpoints are available at `/api/public/*` and do not require authentication. They include CORS headers to allow cross-origin requests from your portfolio website.

## Available Endpoints

### 1. Projects API
**Endpoint:** `GET /api/public/projects`

Returns all published projects with their details.

**Response Structure:**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Project Title",
      "client": "Client Name",
      "category": "Category",
      "data_cat": "data-category",
      "languages": "English, Arabic",
      "classification": "Commercial",
      "vimeo_id": "123456789",
      "video_url": "https://...",
      "poster_image": "https://...",
      "poster_image_srcset": "...",
      "link": "works/project-detail#id=1",
      "credits": [],
      "order_index": 0,
      "is_featured": true,
      "is_published": true
    }
  ],
  "total": 10
}
```

---

### 2. About API
**Endpoint:** `GET /api/public/about`

Returns about page content including founder information and company description.

**Response Structure:**
```json
{
  "page": {
    "title": "About",
    "description": "Award-winning filmmaker and international film production house based in Dubai.",
    "founder": {
      "name": "Ahmed Al Mutawa - Xed",
      "title": "FILM DIRECTOR / EXECUTIVE PRODUCER",
      "bio": "Emirati award-winning filmmaker..."
    },
    "content": {
      "main_text": "Located in the heart of Dubai...",
      "video_button": {
        "text": "view DubaiFilmMaker reel 2025",
        "video_url": "https://video.wixstatic.com/..."
      }
    }
  }
}
```

---

### 3. Contact API
**Endpoint:** `GET /api/public/contact`

Returns contact information including address and social media links.

**Response Structure:**
```json
{
  "page": {
    "title": "Contact",
    "description": "Get in touch with our team",
    "staff": [],
    "address": {
      "street": "",
      "city": "Dubai, UAE",
      "phone": "+971 50 969 9683",
      "email": "hello@dubaifilmmaker.ae"
    },
    "social": {
      "vimeo": "https://vimeo.com/dubaifilmmaker",
      "instagram": "https://www.instagram.com/dubaifilmmaker/"
    }
  }
}
```

---

### 4. Header API
**Endpoint:** `GET /api/public/header`

Returns header configuration including active preset and layout settings.

**Response Structure:**
```json
{
  "activePreset": "default",
  "description": "Header configuration - switch between different header layouts and logo styles",
  "presets": {
    "default": {
      "name": "Default Layout",
      "description": "Logo left, menu right, optimized for horizontal logo",
      "logo": {
        "src": "assets/img/version_2/dubaifilmmaker.svg",
        "alt": "DubaiFilmMaker"
      },
      "mobile": {
        "headerNav": { "alignItems": "center", "padding": "10px 0", ... },
        "logoLink": { "maxWidth": "calc(100% - 100px)", "flex": "1" },
        "logo": { "maxHeight": "80px", "maxWidth": "100%", "width": "auto" }
      },
      "desktop": {
        "logo": { "maxHeight": "80px", "width": "100%" }
      },
      "extraLarge": {
        "logo": { "maxHeight": "100px" }
      }
    }
  }
}
```

---

## CORS Configuration

All endpoints include the following CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Usage in Portfolio Website

Your portfolio website's `data-loader.js` is configured to fetch from these endpoints:

```javascript
const API_CONFIG = {
  USE_CMS_API: true,
  CMS_BASE_URL: 'http://localhost:3000/api/public',
  LOCAL_PATHS: {
    projects: 'data/project.json',
    about: 'data/about.json',
    contact: 'data/contact.json',
    header: 'data/header.json'
  }
};
```

The system automatically falls back to local JSON files if the API is unavailable.

## Testing

Test the endpoints locally:
- https://dubail-film-maker-website-portfolio.vercel.app/api/public/projects
- https://dubail-film-maker-website-portfolio.vercel.app/api/public/about
- https://dubail-film-maker-website-portfolio.vercel.app/api/public/contact
- https://dubail-film-maker-website-portfolio.vercel.app/api/public/header

## Deployment

When deploying to production:
1. Update `CMS_BASE_URL` in your portfolio website's `data-loader.js` to your production CMS URL
2. Ensure CORS is properly configured if you need to restrict origins
3. All endpoints work without authentication for public access
