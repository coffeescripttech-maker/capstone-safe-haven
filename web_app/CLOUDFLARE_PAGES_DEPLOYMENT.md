# Cloudflare Pages Deployment Guide

## ⚠️ Important: Deployment Method

Your Next.js application should be deployed to **Cloudflare Pages**, not as a Cloudflare Worker.

The error you're seeing (`The entry-point file at "src/index.js" was not found`) occurs because `wrangler deploy` is for Workers, not Pages.

---

## 🚀 Correct Deployment Methods

### Method 1: Cloudflare Pages Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Navigate to https://dash.cloudflare.com
   - Select your account
   - Go to "Workers & Pages" → "Pages"

2. **Create a New Project**
   - Click "Create application"
   - Choose "Pages" tab
   - Click "Connect to Git"

3. **Connect Your Repository**
   - Select your Git provider (GitHub, GitLab, etc.)
   - Authorize Cloudflare
   - Select your repository

4. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: final_cms
   ```

5. **Environment Variables**
   Add these in the Pages dashboard:
   ```
   NEXTAUTH_URL=https://your-domain.pages.dev
   NEXTAUTH_SECRET=your-secret-key-here
   R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
   ENVIRONMENT=production
   ```

6. **Bindings**
   - Go to Settings → Functions
   - Add D1 Database binding: `DB` → `dubai-filmmaker-cms`
   - Add R2 Bucket binding: `dubailfilmmaker` → `dubailfilmmaker`

7. **Deploy**
   - Click "Save and Deploy"
   - Wait for build to complete

---

### Method 2: Wrangler CLI for Pages

If you want to use CLI, use `wrangler pages` commands:

#### Install Wrangler (if not installed)
```bash
npm install -g wrangler
```

#### Login to Cloudflare
```bash
wrangler login
```

#### Deploy to Pages
```bash
# Build your Next.js app first
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=dubai-filmmaker-cms
```

#### Deploy with Bindings
```bash
npx wrangler pages deploy .next \
  --project-name=dubai-filmmaker-cms \
  --d1=DB=dubai-filmmaker-cms \
  --r2=dubailfilmmaker=dubailfilmmaker
```

---

## 📝 Updated wrangler.toml

Your `wrangler.toml` has been updated for Pages deployment:

```toml
name = "dubai-filmmaker-cms"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "dubai-filmmaker-cms"
database_id = "908f42f0-ad4d-4ce0-b3a2-9bb13cf54795"

[[r2_buckets]]
binding = "dubailfilmmaker"
bucket_name = "dubailfilmmaker"

[vars]
ENVIRONMENT = "production"
R2_PUBLIC_URL = "https://assets.dubaifilmmaker.ae"
```

**Note:** Removed `main = "src/index.js"` as it's not needed for Pages.

---

## 🔧 Alternative: Use @cloudflare/next-on-pages

For better Next.js support on Cloudflare Pages:

### 1. Install the package
```bash
npm install --save-dev @cloudflare/next-on-pages
```

### 2. Update package.json scripts
```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "pages:dev": "npx @cloudflare/next-on-pages --watch"
  }
}
```

### 3. Build and Deploy
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=dubai-filmmaker-cms
```

---

## 🌐 Custom Domain Setup

After deployment:

1. Go to your Pages project in Cloudflare Dashboard
2. Click "Custom domains"
3. Add your domain: `cms.dubaifilmmaker.ae`
4. Cloudflare will automatically configure DNS

---

## 🔐 Environment Variables

Set these in Cloudflare Pages Dashboard (Settings → Environment variables):

### Production
```
NEXTAUTH_URL=https://cms.dubaifilmmaker.ae
NEXTAUTH_SECRET=<generate-a-secure-secret>
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
ENVIRONMENT=production
```

### Preview (Optional)
```
NEXTAUTH_URL=https://preview.dubai-filmmaker-cms.pages.dev
NEXTAUTH_SECRET=<same-as-production>
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
ENVIRONMENT=preview
```

---

## 📊 Database & Storage Setup

### D1 Database
Your D1 database is already configured:
- Database ID: `908f42f0-ad4d-4ce0-b3a2-9bb13cf54795`
- Binding: `DB`

Make sure to run migrations:
```bash
npm run db:migrate
npm run db:seed
npm run db:users:setup
```

### R2 Bucket
Your R2 bucket is configured:
- Bucket: `dubailfilmmaker`
- Binding: `dubailfilmmaker`

---

## 🚨 Common Issues

### Issue 1: "src/index.js not found"
**Cause:** Using `wrangler deploy` instead of `wrangler pages deploy`
**Fix:** Use Pages deployment method (see above)

### Issue 2: Build fails with module errors
**Cause:** Missing dependencies or incorrect build command
**Fix:** 
```bash
npm install
npm run build
```

### Issue 3: Database not accessible
**Cause:** D1 binding not configured in Pages
**Fix:** Add binding in Pages Settings → Functions

### Issue 4: R2 images not loading
**Cause:** R2 binding not configured or CORS issues
**Fix:** 
- Add R2 binding in Pages Settings
- Configure CORS on R2 bucket

---

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)

---

## ✅ Deployment Checklist

- [ ] Build completes successfully (`npm run build`)
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Users table seeded (`npm run db:users:setup`)
- [ ] Environment variables configured in Pages dashboard
- [ ] D1 binding added to Pages project
- [ ] R2 binding added to Pages project
- [ ] Custom domain configured (optional)
- [ ] Test authentication after deployment
- [ ] Test file uploads to R2
- [ ] Test database operations

---

## 🎯 Quick Deploy Command

For quick deployment after initial setup:

```bash
# Build
npm run build

# Deploy to Pages
npx wrangler pages deploy .next --project-name=dubai-filmmaker-cms
```

Or use the dashboard for automatic deployments on every git push!
