# ⚡ Quick Reference Card

---

## 🚀 Setup Options

```bash
# Option 1: Use existing (5 min)
npm install && npm run dev

# Option 2: Fresh setup (30-45 min)
setup-new-instance.bat

# Option 3: Custom names (30-45 min)
setup-custom-instance.bat
```

---

## 📝 Your Configuration

```
Database Name:  _______________________________
Database ID:    _______________________________
Bucket Name:    _______________________________
Account ID:     _______________________________
Admin Email:    _______________________________
Admin Password: _______________________________
```

---

## 🔧 Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Database (Replace YOUR_DB_NAME)
```bash
wrangler d1 list
wrangler d1 execute YOUR_DB_NAME --remote --command="SELECT * FROM projects;"
wrangler d1 execute YOUR_DB_NAME --remote --command="SELECT * FROM users;"
wrangler d1 execute YOUR_DB_NAME --remote --file=database/d1-schema.sql
```

### R2 Storage (Replace YOUR_BUCKET_NAME)
```bash
wrangler r2 bucket list
wrangler r2 object list YOUR_BUCKET_NAME
wrangler r2 bucket info YOUR_BUCKET_NAME
```

### Authentication
```bash
wrangler login       # Login to Cloudflare
wrangler whoami      # Check account info
wrangler logout      # Logout
```

---

## 📂 Important Files

```
.env.local                    # Your credentials (DO NOT COMMIT!)
wrangler.toml                 # Cloudflare configuration
package.json                  # npm scripts
MY_CONFIGURATION.txt          # Backup of credentials
MY_CUSTOM_NAMES.md           # Quick reference
```

---

## 🔐 Default Credentials (Option 1)

```
URL:      http://localhost:3000/auth/signin
Email:    admin@example.com
Password: admin123
```

---

## 🌐 URLs

```
CMS:              http://localhost:3000
Login:            http://localhost:3000/auth/signin
Projects:         http://localhost:3000/projects
Settings:         http://localhost:3000/settings

Cloudflare:       https://dash.cloudflare.com/
R2 Dashboard:     https://dash.cloudflare.com/ → R2
D1 Dashboard:     https://dash.cloudflare.com/ → Workers & Pages → D1
API Tokens:       https://dash.cloudflare.com/profile/api-tokens
Gmail App Pass:   https://myaccount.google.com/apppasswords
```

---

## 🐛 Quick Troubleshooting

### Cannot login
```bash
wrangler d1 execute YOUR_DB_NAME --remote --command="SELECT * FROM users;"
```

### Database error
```bash
wrangler d1 list
# Check wrangler.toml and .env.local have same database_id
```

### R2 upload fails
```bash
wrangler r2 bucket list
# Check .env.local has correct R2 credentials
```

### Verify setup
```bash
verify-setup.bat
```

---

## 📚 Documentation

```
START_HERE_CUSTOM.md          # Start here for custom setup
CUSTOM_SETUP_GUIDE.md         # Detailed custom setup
FRESH_SETUP_GUIDE.md          # Detailed fresh setup
QUICK_START.md                # Quick start (existing config)
SETUP_SUMMARY.md              # Compare all options
COMPLETE_FEATURES_GUIDE.md    # All features
MY_CUSTOM_NAMES.md            # Command reference
```

---

## ✅ Verification Checklist

```
[ ] Can login to CMS
[ ] Can create project
[ ] Can upload image
[ ] Can upload video
[ ] Can edit project
[ ] Can delete project
[ ] Database queries work
[ ] R2 files list works
```

---

## 🔄 Common Tasks

### Create new project
1. Login to CMS
2. Go to Projects page
3. Click "Add New Project"
4. Fill form and save

### Upload files
1. In project form
2. Click "Upload Image" or "Upload Video"
3. Select file
4. Wait for upload

### Change header logo
1. Go to Settings → Header
2. Select preset
3. Click "Upload Logo"
4. Save changes

### Export projects
1. Go to Projects page
2. Click "Export" button
3. Choose CSV or JSON

---

## 🚀 Deployment

### Update for production
```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build and deploy
```bash
npm run build
# Deploy to Vercel/Cloudflare Pages
```

---

## 📞 Support

- Check documentation files
- Run `verify-setup.bat`
- Review `.env.local` configuration
- Check Cloudflare dashboard

---

**Keep this card handy!** 📌
