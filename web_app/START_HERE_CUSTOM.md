# 🚀 START HERE - Custom Instance Setup

Welcome! This guide will help you set up the CMS with **your own custom database and bucket names**.

---

## 🎯 What You'll Create

- **Cloudflare D1 Database** (your custom name)
- **Cloudflare R2 Bucket** (your custom name)
- **Admin User Account**
- **Complete CMS Configuration**

---

## 📋 Before You Start

### Required Accounts
- [ ] Cloudflare account (free tier works)
- [ ] Gmail account (for email features)

### Required Software
- [ ] Node.js 18+ installed
- [ ] Wrangler CLI installed: `npm install -g wrangler`

### Time Required
⏱️ **30-45 minutes** for complete setup

---

## 🚀 Quick Setup (Automated)

### Option 1: Run Setup Script (Recommended)

```bash
cd final_cms
.\setup-custom-instance.bat
```

**Note:** In PowerShell, you need to use `.\` before the script name.

This script will:
1. ✅ Prompt for your custom database name
2. ✅ Prompt for your custom bucket name
3. ✅ Create both instances
4. ✅ Apply database schema
5. ✅ Create admin user
6. ✅ Generate .env.local file
7. ✅ Save configuration summary

**Follow the prompts and you're done!**

---

## 📖 Manual Setup (Step-by-Step)

### Option 2: Follow Detailed Guide

If you prefer manual setup or want to understand each step:

1. **Read:** `CUSTOM_SETUP_GUIDE.md`
2. **Follow:** Step-by-step instructions
3. **Track:** Use `MY_CUSTOM_NAMES.md` to save your configuration

---

## 🎯 Choose Your Names

Before starting, decide on names for:

### Database Name
**Examples:**
- `dexter-portfolio-cms`
- `my-filmmaker-db`
- `portfolio-cms-2025`

**Rules:**
- Lowercase letters, numbers, hyphens only
- No spaces or special characters
- Must be unique

### Bucket Name
**Examples:**
- `dexter-media-assets`
- `my-portfolio-files`
- `filmmaker-storage-2025`

**Rules:**
- Same as database name rules
- Must be unique across Cloudflare

---

## ✅ After Setup

### 1. Verify Everything Works

```bash
# Check database
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects;"

# Check bucket
wrangler r2 object list YOUR_BUCKET_NAME

# Check users
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM users;"
```

### 2. Start Development Server

```bash
npm install
npm run dev
```

### 3. Login to CMS

Open: http://localhost:3000/auth/signin

Use your admin credentials from setup.

### 4. Test Features

- [ ] Create a new project
- [ ] Upload an image
- [ ] Upload a video
- [ ] Edit project
- [ ] Delete project
- [ ] Configure header settings

---

## 📝 Important Files

After setup, you'll have:

```
final_cms/
├── .env.local                    # Your configuration (DO NOT COMMIT!)
├── wrangler.toml                 # Updated with your database ID
├── MY_CONFIGURATION.txt          # Backup of your credentials
└── MY_CUSTOM_NAMES.md           # Quick reference for your names
```

**⚠️ SECURITY WARNING:**
- Never commit `.env.local` to Git
- Keep `MY_CONFIGURATION.txt` secure
- Store credentials in a password manager

---

## 🔧 Update npm Scripts (Optional)

Edit `package.json` to use your custom names:

```json
{
  "scripts": {
    "db:console": "wrangler d1 execute YOUR_DATABASE_NAME --remote --command=\"SELECT * FROM projects LIMIT 5;\"",
    "r2:list": "wrangler r2 object list YOUR_BUCKET_NAME"
  }
}
```

Replace `YOUR_DATABASE_NAME` and `YOUR_BUCKET_NAME` with your actual names.

---

## 🎨 Customize Further

### Change Project Name

Edit `wrangler.toml`:
```toml
name = "my-custom-cms-name"
```

### Update App URL (Production)

Edit `.env.local`:
```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 🐛 Troubleshooting

### Setup Script Fails

**Solution:** Follow manual setup in `CUSTOM_SETUP_GUIDE.md`

### Database Connection Error

```bash
# Verify database exists
wrangler d1 list

# Check database ID in wrangler.toml
# Check CLOUDFLARE_DATABASE_ID in .env.local
```

### R2 Upload Fails

```bash
# Verify bucket exists
wrangler r2 bucket list

# Check R2 credentials in .env.local
# Verify public access is enabled
```

### Cannot Login

```bash
# Check if admin user exists
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM users;"

# Verify password is hashed (starts with $2a$10$)
```

---

## 📚 Documentation

### Setup Guides
- `CUSTOM_SETUP_GUIDE.md` - **Detailed manual setup**
- `FRESH_SETUP_GUIDE.md` - Alternative setup guide
- `MIGRATION_CHECKLIST.md` - Track your progress

### Reference
- `MY_CUSTOM_NAMES.md` - Quick command reference
- `QUICK_START.md` - Quick start guide
- `COMPLETE_FEATURES_GUIDE.md` - All features

### Scripts
- `setup-custom-instance.bat` - Automated setup
- `verify-setup.bat` - Verify configuration

---

## 🎯 Quick Commands Reference

Replace `YOUR_DATABASE_NAME` and `YOUR_BUCKET_NAME`:

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production

# Database
wrangler d1 list              # List databases
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects;"

# R2 Storage
wrangler r2 bucket list       # List buckets
wrangler r2 object list YOUR_BUCKET_NAME

# Authentication
wrangler login                # Login to Cloudflare
wrangler whoami               # Check account info
```

---

## 🚀 Next Steps

1. ✅ Complete setup (automated or manual)
2. 🔐 Save your credentials securely
3. 🎨 Login and explore the CMS
4. 📊 Add your first project
5. 📸 Upload media files
6. ⚙️ Configure header settings
7. 🌐 Deploy to production
8. 🔗 Connect portfolio website

---

## 🆘 Need Help?

### Check Documentation
1. Read `CUSTOM_SETUP_GUIDE.md` for detailed instructions
2. Check `MY_CUSTOM_NAMES.md` for command reference
3. Review `COMPLETE_FEATURES_GUIDE.md` for features

### Verify Setup
```bash
verify-setup.bat
```

### Common Issues
- **Database not found:** Check `wrangler.toml` and `.env.local`
- **R2 upload fails:** Verify R2 credentials and public access
- **Login fails:** Check admin user exists and password is hashed
- **Email not sending:** Verify Gmail App Password (16 chars)

### External Resources
- Cloudflare Docs: https://developers.cloudflare.com/
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
- NextAuth Docs: https://next-auth.js.org/

---

## ✨ You're Ready!

Choose your setup method:

### 🤖 Automated (Recommended)
```bash
setup-custom-instance.bat
```

### 📖 Manual (Detailed)
Read `CUSTOM_SETUP_GUIDE.md`

---

**Good luck with your setup!** 🎉

If you encounter any issues, check the troubleshooting section or review the documentation files.
