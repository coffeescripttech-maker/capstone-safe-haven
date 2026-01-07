# 🚀 Custom Setup Guide - Your Own Database & Bucket Names

This guide helps you set up the CMS with **your own custom names** for database and storage bucket.

---

## 📝 Choose Your Names

Before starting, decide on your naming convention:

```
Database Name: _________________ (e.g., my-portfolio-db, filmmaker-cms-2025)
Bucket Name:   _________________ (e.g., my-assets, portfolio-media)
```

**Naming Rules:**
- Lowercase letters, numbers, and hyphens only
- No spaces or special characters
- Must be unique across Cloudflare
- Descriptive and memorable

**Examples:**
- `dexter-portfolio-cms` / `dexter-media-assets`
- `filmmaker-cms-prod` / `filmmaker-storage-prod`
- `portfolio-db-2025` / `portfolio-files-2025`

---

## 🔐 Step 1: Cloudflare Authentication

```bash
# Login to Cloudflare
wrangler login

# Get your Account ID
wrangler whoami
```

**Save your Account ID:** `_______________________________`

---

## 🗄️ Step 2: Create D1 Database (Custom Name)

### 2.1 Create Database with Your Name

```bash
# Replace YOUR_DATABASE_NAME with your chosen name
wrangler d1 create YOUR_DATABASE_NAME
```

**Example:**
```bash
wrangler d1 create dexter-portfolio-cms
```

**Output:**
```
✅ Successfully created DB 'dexter-portfolio-cms'!

[[d1_databases]]
binding = "DB"
database_name = "dexter-portfolio-cms"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Save these:**
- Database Name: `_______________________________`
- Database ID: `_______________________________`

### 2.2 Update wrangler.toml

Open `final_cms/wrangler.toml` and update:

```toml
name = "dubai-filmmaker-cms"  # You can change this too

[[d1_databases]]
binding = "DB"
database_name = "YOUR_DATABASE_NAME"      # ← Your custom name
database_id = "YOUR_DATABASE_ID"          # ← Your database ID
```

**Example:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "dexter-portfolio-cms"
database_id = "abc123-def456-ghi789-jkl012"
```

### 2.3 Apply Database Schema

```bash
cd final_cms

# Replace YOUR_DATABASE_NAME with your actual database name

# Apply projects schema
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/d1-schema.sql

# Apply users schema
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/users-schema.sql

# Apply header config schema
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/update-header-config.sql
```

**Example:**
```bash
wrangler d1 execute dexter-portfolio-cms --remote --file=database/d1-schema.sql
wrangler d1 execute dexter-portfolio-cms --remote --file=database/users-schema.sql
wrangler d1 execute dexter-portfolio-cms --remote --file=database/update-header-config.sql
```

### 2.4 Seed Sample Data (Optional)

```bash
# Replace YOUR_DATABASE_NAME
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/insert_projects_d1.sql
```

### 2.5 Verify Database

```bash
# Replace YOUR_DATABASE_NAME
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects LIMIT 3;"
```

---

## 📦 Step 3: Create R2 Bucket (Custom Name)

### 3.1 Create Bucket with Your Name

```bash
# Replace YOUR_BUCKET_NAME with your chosen name
wrangler r2 bucket create YOUR_BUCKET_NAME
```

**Example:**
```bash
wrangler r2 bucket create dexter-media-assets
```

**Output:**
```
✅ Created bucket 'dexter-media-assets'
```

**Save your Bucket Name:** `_______________________________`

### 3.2 Enable Public Access

```bash
# Replace YOUR_BUCKET_NAME
wrangler r2 bucket update YOUR_BUCKET_NAME --public-access
```

### 3.3 Get R2 Endpoint

Your R2 endpoint format:
```
https://<ACCOUNT_ID>.r2.cloudflarestorage.com
```

Replace `<ACCOUNT_ID>` with your Cloudflare Account ID from Step 1.

**Example:**
```
https://abc123def456ghi789.r2.cloudflarestorage.com
```

**Save this:** `_______________________________`

### 3.4 Create R2 API Token

1. Go to: https://dash.cloudflare.com/
2. Click **R2** in the left sidebar
3. Click **Manage R2 API Tokens**
4. Click **Create API Token**
5. Configure:
   - **Token Name:** `my-portfolio-r2-token` (or your choice)
   - **Permissions:** `Object Read & Write`
   - **Bucket:** Select **YOUR_BUCKET_NAME**
   - **TTL:** Never expire
6. Click **Create API Token**

**Copy and save:**
- Access Key ID: `_______________________________`
- Secret Access Key: `_______________________________`

### 3.5 Get R2 Public URL

1. Go to: https://dash.cloudflare.com/
2. Click **R2** → **YOUR_BUCKET_NAME**
3. Click **Settings** tab
4. Under **Public Access**, click **Allow Access**
5. Copy the **Public Bucket URL**

**Example:** `https://pub-xyz789abc123.r2.dev`

**Save this:** `_______________________________`

### 3.6 Configure CORS

Create `r2-cors-config.json` (already exists in project):
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
# Replace YOUR_BUCKET_NAME
wrangler r2 bucket cors put YOUR_BUCKET_NAME --config=r2-cors-config.json
```

---

## 🔑 Step 4: Create Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Create Custom Token**
4. Configure:
   - **Token Name:** `my-portfolio-api-token`
   - **Permissions:**
     - Account → D1 → Edit
     - Account → Workers R2 Storage → Edit
   - **Account Resources:** Include → Your Account
   - **TTL:** Never expire
5. Click **Continue to Summary**
6. Click **Create Token**

**Copy and save:** `_______________________________`

---

## 🔐 Step 5: Generate NextAuth Secret

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copy and save (44 characters):** `_______________________________`

---

## 📧 Step 6: Setup Gmail

### 6.1 Enable 2FA
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**

### 6.2 Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **App:** Mail
3. Select **Device:** Other (Custom name)
4. Enter name: `My Portfolio CMS`
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

**Save:**
- Gmail: `_______________________________`
- App Password: `_______________________________`

---

## 👤 Step 7: Create Admin User

### 7.1 Hash Your Password

Create temporary file `hash-my-password.js`:
```javascript
const bcrypt = require('bcryptjs');

const password = 'YOUR_SECURE_PASSWORD_HERE'; // Change this!
const hash = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hash);
```

Run it:
```bash
node hash-my-password.js
```

**Copy the hashed password:** `_______________________________`

Delete the file:
```bash
del hash-my-password.js
```

### 7.2 Create Admin User in Database

```bash
# Replace YOUR_DATABASE_NAME, YOUR_EMAIL, and HASHED_PASSWORD
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="INSERT INTO users (email, password, name, role) VALUES ('YOUR_EMAIL', 'HASHED_PASSWORD', 'Admin User', 'admin');"
```

**Example:**
```bash
wrangler d1 execute dexter-portfolio-cms --remote --command="INSERT INTO users (email, password, name, role) VALUES ('admin@myportfolio.com', '$2a$10$abc123...', 'Admin User', 'admin');"
```

**Save your credentials:**
- Email: `_______________________________`
- Password: `_______________________________`

---

## 📝 Step 8: Create .env.local File

Create `final_cms/.env.local` with your custom values:

```env
# ========================================
# NextAuth Configuration
# ========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_FROM_STEP_5

# ========================================
# Google OAuth (Optional)
# ========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ========================================
# Cloudflare R2 Storage Configuration
# ========================================
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_FROM_STEP_3
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY_FROM_STEP_3
R2_BUCKET_NAME=YOUR_BUCKET_NAME
R2_PUBLIC_URL=https://pub-YOUR_BUCKET_ID.r2.dev

# ========================================
# Supabase (Optional)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ========================================
# Cloudflare D1 Database Configuration
# ========================================
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID_FROM_STEP_1
CLOUDFLARE_API_TOKEN=YOUR_API_TOKEN_FROM_STEP_4
CLOUDFLARE_DATABASE_ID=YOUR_DATABASE_ID_FROM_STEP_2

# ========================================
# Cloudflare Pages Analytics
# ========================================
CLOUDFLARE_PROJECT_NAME=my-portfolio-cms

# ========================================
# Cloudflare Web Analytics (Optional)
# ========================================
CLOUDFLARE_WEB_ANALYTICS_SITE_ID=your-site-id

# ========================================
# App Configuration
# ========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ========================================
# Email Configuration
# ========================================
EMAIL_PROVIDER=gmail
GMAIL_USER=YOUR_GMAIL_FROM_STEP_6
GMAIL_APP_PASSWORD=YOUR_APP_PASSWORD_FROM_STEP_6
```

---

## 📦 Step 9: Update package.json Scripts (Optional)

If you want to update the npm scripts to use your custom names, edit `package.json`:

```json
{
  "scripts": {
    "db:console": "wrangler d1 execute YOUR_DATABASE_NAME --remote --command=\"SELECT * FROM projects LIMIT 5;\"",
    "db:users:list": "wrangler d1 execute YOUR_DATABASE_NAME --remote --command=\"SELECT id, email, name, role FROM users;\"",
    "r2:list": "wrangler r2 object list YOUR_BUCKET_NAME"
  }
}
```

**Example:**
```json
{
  "scripts": {
    "db:console": "wrangler d1 execute dexter-portfolio-cms --remote --command=\"SELECT * FROM projects LIMIT 5;\"",
    "db:users:list": "wrangler d1 execute dexter-portfolio-cms --remote --command=\"SELECT id, email, name, role FROM users;\"",
    "r2:list": "wrangler r2 object list dexter-media-assets"
  }
}
```

---

## ✅ Step 10: Verify Setup

### 10.1 Install Dependencies
```bash
cd final_cms
npm install
```

### 10.2 Test Database
```bash
# Replace YOUR_DATABASE_NAME
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT COUNT(*) FROM projects;"
```

### 10.3 Test R2
```bash
# Replace YOUR_BUCKET_NAME
wrangler r2 object list YOUR_BUCKET_NAME
```

### 10.4 Test Users
```bash
# Replace YOUR_DATABASE_NAME
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT email, name, role FROM users;"
```

### 10.5 Start Development Server
```bash
npm run dev
```

### 10.6 Test Login
1. Open: http://localhost:3000
2. Go to: http://localhost:3000/auth/signin
3. Login with your admin credentials

---

## 🎯 Quick Reference - Your Custom Names

Fill this out for easy reference:

```
Database Name:     _______________________________
Database ID:       _______________________________
Bucket Name:       _______________________________
R2 Public URL:     _______________________________
Account ID:        _______________________________
API Token:         _______________________________
Admin Email:       _______________________________
Admin Password:    _______________________________
```

---

## 📋 Common Commands with Your Names

Replace `YOUR_DATABASE_NAME` and `YOUR_BUCKET_NAME` with your actual names:

```bash
# Database Commands
wrangler d1 list
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects;"
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM users;"

# R2 Commands
wrangler r2 bucket list
wrangler r2 object list YOUR_BUCKET_NAME
wrangler r2 bucket info YOUR_BUCKET_NAME

# Development
npm run dev
npm run build
npm run start
```

---

## 🔄 Migration from Old Names

If you're migrating from the old database/bucket names:

### Export Data from Old Database
```bash
# Export projects
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM projects;" > old_projects.sql

# Export users
wrangler d1 execute dubai-filmmaker-cms --remote --command="SELECT * FROM users;" > old_users.sql
```

### Import to New Database
```bash
# Import to your new database
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=old_projects.sql
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=old_users.sql
```

### Copy R2 Files
```bash
# List old files
wrangler r2 object list dubai-filmmaker-assets

# Download files (manual process)
# Then upload to new bucket through CMS UI or wrangler
```

---

## 🚀 Production Deployment

When deploying to production, update these in your hosting platform:

### Environment Variables
- `NEXTAUTH_URL` → Your production URL
- `NEXT_PUBLIC_APP_URL` → Your production URL
- All other variables from `.env.local`

### Cloudflare Pages Bindings
If deploying to Cloudflare Pages:

1. Go to: https://dash.cloudflare.com/
2. Navigate to **Workers & Pages** → Your project
3. Click **Settings** → **Functions**
4. Add **D1 Database Binding:**
   - Variable name: `DB`
   - D1 database: `YOUR_DATABASE_NAME`
5. Add **R2 Bucket Binding:**
   - Variable name: `R2`
   - R2 bucket: `YOUR_BUCKET_NAME`

---

## 🎉 Setup Complete!

Your CMS is now running with your custom database and bucket names!

**Next Steps:**
1. ✅ Login to CMS
2. 🎨 Add your projects
3. 📸 Upload media files
4. ⚙️ Configure header settings
5. 🌐 Deploy to production
6. 🔗 Connect portfolio website

**Congratulations!** 🚀
