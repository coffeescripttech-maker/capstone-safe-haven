# 🔧 Manual Setup Guide (No Wrangler CLI)

Use this guide if you're having issues with Wrangler CLI or prefer to use the Cloudflare Dashboard directly.

---

## 🎯 What You'll Create

- Cloudflare D1 Database (via Dashboard)
- Cloudflare R2 Bucket (via Dashboard)
- API Tokens (via Dashboard)
- Local configuration files

---

## 📋 Prerequisites

- Cloudflare account (free tier works)
- Gmail account (for emails)
- Node.js 18+ installed
- Browser access to Cloudflare Dashboard

---

## 🗄️ Step 1: Create D1 Database

### 1.1 Go to D1 Dashboard
https://dash.cloudflare.com/ → **Workers & Pages** → **D1**

### 1.2 Create Database
1. Click **Create database**
2. Enter name: `your-database-name` (e.g., `dexter-portfolio-cms`)
3. Click **Create**

### 1.3 Save Database ID
After creation, you'll see:
```
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Save this:** `5ba19e3d-dfda-4ced-84b4-1769d9e65a77`

### 1.4 Apply Schema via Dashboard

1. Click on your database name
2. Go to **Console** tab
3. Copy and paste the contents of `database/d1-schema.sql`
4. Click **Execute**
5. Repeat for `database/users-schema.sql`
6. Repeat for `database/update-header-config.sql`

### 1.5 Seed Sample Data (Optional)

1. In Console tab
2. Copy and paste contents of `database/insert_projects_d1.sql`
3. Click **Execute**

---

## 📦 Step 2: Create R2 Bucket

### 2.1 Go to R2 Dashboard
https://dash.cloudflare.com/ → **R2**

### 2.2 Create Bucket
1. Click **Create bucket**
2. Enter name: `your-bucket-name` (e.g., `dexter-media-assets`)
3. Click **Create bucket**

### 2.3 Enable Public Access
1. Click on your bucket name
2. Go to **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Copy the **Public Bucket URL**

**Example:** `https://pub-abc123def456.r2.dev`

**Save this:** `https://pub-897782f3aec54402813e3172e227fa0b.r2.dev`

### 2.4 Create R2 API Token
1. Click **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure:
   - **Token Name:** `my-portfolio-r2-token`
   - **Permissions:** Object Read & Write
   - **Bucket:** Select your bucket
   - **TTL:** Never expire
4. Click **Create API Token**

**Copy and save:**
- Access Key ID: `_______________________________`
- Secret Access Key: `_______________________________`

---

## 🔑 Step 3: Create Cloudflare API Token

### 3.1 Go to API Tokens
https://dash.cloudflare.com/profile/api-tokens

### 3.2 Create Custom Token
1. Click **Create Token**
2. Click **Create Custom Token**
3. Configure:
   - **Token Name:** `my-portfolio-api-token`
   - **Permissions:**
     - Account → D1 → Edit
     - Account → Workers R2 Storage → Edit
   - **Account Resources:** Include → Your Account
   - **TTL:** Never expire
4. Click **Continue to Summary**
5. Click **Create Token**

**Copy and save:** `_______________________________`

---

## 🔐 Step 4: Get Account ID

### 4.1 Go to Dashboard
https://dash.cloudflare.com/

### 4.2 Find Account ID
1. Look at the URL in your browser
2. It will be: `https://dash.cloudflare.com/YOUR_ACCOUNT_ID/...`
3. Or click on any service and check the URL

**Copy and save:** `_______________________________`

---

## 🔐 Step 5: Generate NextAuth Secret

### 5.1 Open PowerShell/Terminal

```powershell
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

Create a temporary file `hash-password.js`:

```javascript
const bcrypt = require('bcryptjs');

const password = 'YOUR_SECURE_PASSWORD_HERE'; // Change this!
const hash = bcrypt.hashSync(password, 10);

console.log('Hashed password:', hash);
```

Run it:
```powershell
node hash-password.js
```

**Copy the hashed password:** `_______________________________`

Delete the file:
```powershell
del hash-password.js
```

### 7.2 Create User in Database

1. Go to D1 Dashboard: https://dash.cloudflare.com/ → D1 → Your Database
2. Go to **Console** tab
3. Execute this SQL (replace values):

```sql
INSERT INTO users (email, password, name, role) 
VALUES (
  'your-email@example.com',
  'YOUR_HASHED_PASSWORD_HERE',
  'Admin User',
  'admin'
);
```

4. Click **Execute**

**Save your credentials:**
- Email: `_______________________________`
- Password: `_______________________________`

---

## 📝 Step 8: Create .env.local File

Create `final_cms/.env.local` with your values:

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
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY_FROM_STEP_2
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY_FROM_STEP_2
R2_BUCKET_NAME=YOUR_BUCKET_NAME
R2_PUBLIC_URL=YOUR_PUBLIC_URL_FROM_STEP_2

# ========================================
# Supabase (Optional)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ========================================
# Cloudflare D1 Database Configuration
# ========================================
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID_FROM_STEP_4
CLOUDFLARE_API_TOKEN=YOUR_API_TOKEN_FROM_STEP_3
CLOUDFLARE_DATABASE_ID=YOUR_DATABASE_ID_FROM_STEP_1

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

## 🔧 Step 9: Update wrangler.toml

Edit `final_cms/wrangler.toml`:

```toml
name = "my-portfolio-cms"  # Your project name

[[d1_databases]]
binding = "DB"
database_name = "YOUR_DATABASE_NAME"
database_id = "YOUR_DATABASE_ID"
```

---

## ✅ Step 10: Test Your Setup

### 10.1 Install Dependencies
```powershell
cd final_cms
npm install
```

### 10.2 Start Development Server
```powershell
npm run dev
```

### 10.3 Test Login
1. Open: http://localhost:3000
2. Go to: http://localhost:3000/auth/signin
3. Login with your admin credentials

### 10.4 Test Features
- [ ] Can login
- [ ] Can view projects page
- [ ] Can create new project
- [ ] Can upload image
- [ ] Can upload video

---

## 📋 Configuration Summary

Save this for your records:

```
Database Name:     _______________________________
Database ID:       _______________________________
Bucket Name:       _______________________________
R2 Public URL:     _______________________________
Account ID:        _______________________________
API Token:         _______________________________
R2 Access Key:     _______________________________
R2 Secret Key:     _______________________________
Admin Email:       _______________________________
Admin Password:    _______________________________
NextAuth Secret:   _______________________________
Gmail User:        _______________________________
Gmail App Pass:    _______________________________
```

---

## 🐛 Troubleshooting

### Cannot login
1. Go to D1 Dashboard → Your Database → Console
2. Execute: `SELECT * FROM users;`
3. Verify user exists and password starts with `$2a$10$`

### R2 upload fails
1. Verify R2 credentials in `.env.local`
2. Check bucket has public access enabled
3. Verify API token has R2 permissions

### Database connection error
1. Verify `CLOUDFLARE_DATABASE_ID` in `.env.local`
2. Check `wrangler.toml` has same database_id
3. Verify API token has D1 permissions

---

## 🎉 Setup Complete!

Your CMS is now configured without using Wrangler CLI!

**Next Steps:**
1. Start creating content
2. Upload media files
3. Configure header settings
4. Deploy to production

---

**All done via Cloudflare Dashboard!** 🚀
