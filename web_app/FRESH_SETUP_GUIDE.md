# 🚀 Fresh Setup Guide - Create New Instances

This guide will help you create **brand new instances** of all required services for your Dubai Filmmaker CMS.

---

## 📋 Prerequisites

1. **Node.js 18+** installed
2. **Cloudflare account** (free tier works)
3. **Wrangler CLI** installed globally:
   ```bash
   npm install -g wrangler
   ```
4. **Gmail account** (for email features)
5. **Google Cloud Console** account (optional, for OAuth)

---

## 🔐 Step 1: Cloudflare Authentication

### 1.1 Login to Cloudflare
```bash
wrangler login
```
This will open a browser window. Log in to your Cloudflare account and authorize Wrangler.

### 1.2 Get Your Account ID
```bash
wrangler whoami
```

**Copy the Account ID** - you'll need this for `.env.local`

Example output:
```
👋 You are logged in with an OAuth Token, associated with the email 'your-email@example.com'!
┌──────────────────────────────────┬──────────────────────────────────┐
│ Account Name                     │ Account ID                       │
├──────────────────────────────────┼──────────────────────────────────┤
│ Your Account                     │ abc123def456ghi789jkl012mno345   │
└──────────────────────────────────┴──────────────────────────────────┘
```

**Save this:** `CLOUDFLARE_ACCOUNT_ID=abc123def456ghi789jkl012mno345`

---

## 🗄️ Step 2: Create Cloudflare D1 Database

### 2.1 Create New Database
```bash
wrangler d1 create dubai-filmmaker-cms
```

**Output:**
```
✅ Successfully created DB 'dubai-filmmaker-cms'!

[[d1_databases]]
binding = "DB"
database_name = "dubai-filmmaker-cms"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Save this:** `CLOUDFLARE_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### 2.2 Update wrangler.toml
Open `final_cms/wrangler.toml` and update:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dubai-filmmaker-cms"
database_id = "YOUR_NEW_DATABASE_ID_HERE"
```

### 2.3 Apply Database Schema
```bash
cd final_cms

# Apply projects schema
wrangler d1 execute dubai-filmmaker-cms --remote --file=database/d1-schema.sql

# Apply users schema
wrangler d1 execute dubai-filmmaker-cms --remote --file=database/users-schema.sql

# Apply header config schema
wrangler d1 execute dubai-filmmaker-cms --remote --file=database/update-header-config.sql
```

### 2.4 Seed Sample Data
```bash
# Seed projects
wrangler d1 execute dubai-filmmaker-cms --remote --file=database/insert_projects_d1.sql

# Create admin user
wrangler d1 execute dubai-filmmaker-cms --remote --command="
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@example.com',
  '\$2a\$10\$YourHashedPasswordHere',
  'Admin User',
  'admin'
);"
```

**Note:** You'll hash the password in Step 7.

### 2.5 Verify Database
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM projects LIMIT 3;"
```

---

## 📦 Step 3: Create Cloudflare R2 Bucket

### 3.1 Create New Bucket
```bash
wrangler r2 bucket create dubai-filmmaker-assets
```

**Output:**
```
✅ Created bucket 'dubai-filmmaker-assets'
```

### 3.2 Enable Public Access
```bash
wrangler r2 bucket update dubai-filmmaker-assets --public-access
```

### 3.3 Get R2 Endpoint
Your R2 endpoint format:
```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Replace `<ACCOUNT_ID>` with your Cloudflare Account ID from Step 1.2.

**Save this:** `R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com`

### 3.4 Create R2 API Token

1. Go to: https://dash.cloudflare.com/
2. Click on **R2** in the left sidebar
3. Click **Manage R2 API Tokens**
4. Click **Create API Token**
5. Configure:
   - **Token Name:** `dubai-filmmaker-r2-token`
   - **Permissions:** `Object Read & Write`
   - **Bucket:** `dubai-filmmaker-assets`
   - **TTL:** Never expire (or set your preference)
6. Click **Create API Token**

**Copy the credentials:**
```
Access Key ID: xxxxxxxxxxxxxxxxxxxx
Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

**Save these:**
```
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
R2_BUCKET_NAME=dubai-filmmaker-assets
```

### 3.5 Get R2 Public URL

1. Go to: https://dash.cloudflare.com/
2. Click **R2** → **dubai-filmmaker-assets**
3. Click **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Copy the **Public Bucket URL**

Example: `https://pub-abc123def456.r2.dev`

**Save this:** `R2_PUBLIC_URL=https://pub-abc123def456.r2.dev`

### 3.6 Configure CORS (Optional but Recommended)

Create `r2-cors-config.json`:
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Apply CORS:
```bash
wrangler r2 bucket cors put dubai-filmmaker-assets --config=r2-cors-config.json
```

---

## 🔑 Step 4: Create Cloudflare API Token (for D1 Access)

### 4.1 Create API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Create Custom Token**
4. Configure:
   - **Token Name:** `dubai-filmmaker-d1-token`
   - **Permissions:**
     - Account → D1 → Edit
     - Account → Workers R2 Storage → Edit
   - **Account Resources:** Include → Your Account
   - **TTL:** Never expire (or set your preference)
5. Click **Continue to Summary**
6. Click **Create Token**

**Copy the token:**
```
Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save this:** `CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 Step 5: Generate NextAuth Secret

### 5.1 Generate Random Secret
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copy the output** (should be 44 characters)

**Save this:** `NEXTAUTH_SECRET=your-generated-secret-here`

---

## 📧 Step 6: Setup Gmail for Email

### 6.1 Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** if not already enabled

### 6.2 Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **App:** Mail
3. Select **Device:** Other (Custom name)
4. Enter name: `Dubai Filmmaker CMS`
5. Click **Generate**
6. **Copy the 16-character password** (remove spaces)

**Save these:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

---

## 🔐 Step 7: Hash Admin Password

### 7.1 Install bcryptjs (if not already)
```bash
cd final_cms
npm install
```

### 7.2 Hash Your Password
Create a temporary file `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');

const password = 'your-secure-password-here'; // Change this!
const hash = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hash);
```

Run it:
```bash
node hash-password.js
```

**Copy the hashed password** (starts with `$2a$10$...`)

### 7.3 Create Admin User
```bash
wrangler d1 execute dubai-filmmaker-cms --remote --command="
INSERT INTO users (email, password, name, role) 
VALUES (
  'admin@example.com',
  'YOUR_HASHED_PASSWORD_HERE',
  'Admin User',
  'admin'
);"
```

**Delete the temporary file:**
```bash
rm hash-password.js
```

---

## 🌐 Step 8: Setup Cloudflare Web Analytics (Optional)

### 8.1 Create Web Analytics Site

1. Go to: https://dash.cloudflare.com/
2. Click **Analytics & Logs** → **Web Analytics**
3. Click **Add a site**
4. Enter:
   - **Hostname:** `dubaifilmmaker.ae` (or your domain)
   - **Site name:** Dubai Filmmaker Portfolio
5. Click **Add site**

**Copy the Site ID** from the JavaScript snippet:
```javascript
data-cf-beacon='{"token": "YOUR_SITE_ID_HERE"}'
```

**Save this:** `CLOUDFLARE_WEB_ANALYTICS_SITE_ID=YOUR_SITE_ID_HERE`

---

## 📝 Step 9: Create Your .env.local File

Create `final_cms/.env.local` with your new credentials:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-from-step-5

# Google OAuth (Optional - for Google Sign In)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-r2-access-key-from-step-3
R2_SECRET_ACCESS_KEY=your-r2-secret-key-from-step-3
R2_BUCKET_NAME=dubai-filmmaker-assets
R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev

# Supabase (Optional - if you want to use Supabase instead of D1)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cloudflare D1 Database Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id-from-step-1
CLOUDFLARE_API_TOKEN=your-api-token-from-step-4
CLOUDFLARE_DATABASE_ID=your-database-id-from-step-2

# Cloudflare Pages Analytics Configuration
CLOUDFLARE_PROJECT_NAME=dubai-filmmaker-cms

# Cloudflare Web Analytics
CLOUDFLARE_WEB_ANALYTICS_SITE_ID=your-site-id-from-step-8

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Provider Configuration
EMAIL_PROVIDER=gmail

# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password-from-step-6
```

---

## ✅ Step 10: Verify Setup

### 10.1 Test Database Connection
```bash
cd final_cms
npm run db:console
```

Expected output: List of projects

### 10.2 Test R2 Connection
```bash
npm run r2:list
```

Expected output: Empty list (no files yet) or list of files

### 10.3 Test Users
```bash
npm run db:users:list
```

Expected output: Your admin user

### 10.4 Start Development Server
```bash
npm run dev
```

### 10.5 Test Login
1. Open: http://localhost:3000
2. Go to: http://localhost:3000/auth/signin
3. Login with:
   - Email: `admin@example.com`
   - Password: `your-secure-password-here` (the one you hashed)

---

## 🚀 Step 11: Update Portfolio Website

Update `final_portfolio_website/assets/js/data-loader.js`:

```javascript
const API_CONFIG = {
  USE_CMS_API: true,
  CMS_BASE_URL: 'http://localhost:3000/api/public', // For local testing
  // CMS_BASE_URL: 'https://your-cms-domain.com/api/public', // For production
  LOCAL_PATHS: {
    projects: 'data/project.json',
    about: 'data/about.json',
    contact: 'data/contact.json',
    header: 'data/header.json'
  }
};
```

---

## 🎯 Quick Reference - All Commands

```bash
# Cloudflare Login
wrangler login
wrangler whoami

# D1 Database
wrangler d1 create dubai-filmmaker-cms
wrangler d1 execute dubai-filmmaker-cms --remote --file=database/d1-schema.sql
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM projects;"

# R2 Storage
wrangler r2 bucket create dubai-filmmaker-assets
wrangler r2 bucket list
wrangler r2 object list dubai-filmmaker-assets

# Development
npm install
npm run dev

# Database Management
npm run db:migrate
npm run db:seed
npm run db:console
npm run db:users:list

# R2 Management
npm run r2:list
npm run r2:info
```

---

## 🔒 Security Checklist

- [ ] Generated strong NEXTAUTH_SECRET (32+ characters)
- [ ] Created unique admin password (not "admin123")
- [ ] Hashed admin password with bcrypt
- [ ] Secured Gmail with App Password (not main password)
- [ ] Restricted R2 API token to specific bucket
- [ ] Restricted Cloudflare API token to D1 and R2 only
- [ ] Added `.env.local` to `.gitignore`
- [ ] Never committed `.env.local` to Git

---

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check if database exists
wrangler d1 list

# Check if you're logged in
wrangler whoami

# Verify database ID in wrangler.toml matches .env.local
```

### R2 Upload Failed
```bash
# Check bucket exists
wrangler r2 bucket list

# Verify credentials
wrangler r2 object list dubai-filmmaker-assets

# Check CORS configuration
wrangler r2 bucket cors get dubai-filmmaker-assets
```

### Login Failed
```bash
# Check if user exists
npm run db:users:list

# Verify password is hashed
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT email, SUBSTR(password, 1, 10) FROM users;"

# Password should start with: $2a$10$...
```

### Email Not Sending
- Verify Gmail App Password (16 characters, no spaces)
- Check 2FA is enabled on Gmail account
- Test with a simple email first

---

## 📚 Next Steps

1. ✅ Complete this setup guide
2. 🎨 Customize your CMS (add projects, upload logos)
3. 🌐 Deploy CMS to production (Vercel/Cloudflare Pages)
4. 🔗 Update portfolio website API URL
5. 🚀 Deploy portfolio website
6. 📊 Monitor analytics

---

## 🆘 Need Help?

- **Cloudflare Docs:** https://developers.cloudflare.com/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/
- **NextAuth Docs:** https://next-auth.js.org/
- **Project Docs:** Check other `.md` files in this folder

---

**You're all set!** 🎉

Your Dubai Filmmaker CMS is now running with **brand new instances** of all services.
