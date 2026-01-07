# 📝 My Custom Configuration

Use this file to track your custom database and bucket names.

---

## 🎯 Your Custom Names

```
Database Name:  _______________________________
Database ID:    _______________________________
Bucket Name:    _______________________________
```

---

## 📋 Quick Commands with Your Names

Replace the placeholders with your actual names:

### Database Commands

```bash
# List all databases
wrangler d1 list

# Query your database
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects;"

# List users
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM users;"

# Count projects
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT COUNT(*) FROM projects;"

# Apply schema
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/d1-schema.sql

# Seed data
wrangler d1 execute YOUR_DATABASE_NAME --remote --file=database/insert_projects_d1.sql
```

### R2 Commands

```bash
# List all buckets
wrangler r2 bucket list

# List files in your bucket
wrangler r2 object list YOUR_BUCKET_NAME

# Get bucket info
wrangler r2 bucket info YOUR_BUCKET_NAME

# Configure CORS
wrangler r2 bucket cors put YOUR_BUCKET_NAME --config=r2-cors-config.json

# Get CORS config
wrangler r2 bucket cors get YOUR_BUCKET_NAME
```

---

## 🔧 Update package.json Scripts

Edit `package.json` and replace the database/bucket names:

```json
{
  "scripts": {
    "db:console": "wrangler d1 execute YOUR_DATABASE_NAME --remote --command=\"SELECT * FROM projects LIMIT 5;\"",
    "db:console:local": "wrangler d1 execute YOUR_DATABASE_NAME --command=\"SELECT * FROM projects LIMIT 5;\"",
    "db:users:list": "wrangler d1 execute YOUR_DATABASE_NAME --remote --command=\"SELECT id, email, name, role FROM users;\"",
    "r2:list": "wrangler r2 object list YOUR_BUCKET_NAME"
  }
}
```

---

## 📝 Update wrangler.toml

Edit `wrangler.toml`:

```toml
name = "my-portfolio-cms"  # Your project name

[[d1_databases]]
binding = "DB"
database_name = "YOUR_DATABASE_NAME"
database_id = "YOUR_DATABASE_ID"
```

---

## 🔐 Your .env.local Configuration

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=YOUR_API_TOKEN
CLOUDFLARE_DATABASE_ID=YOUR_DATABASE_ID

# R2 Storage
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=YOUR_R2_ACCESS_KEY
R2_SECRET_ACCESS_KEY=YOUR_R2_SECRET_KEY
R2_BUCKET_NAME=YOUR_BUCKET_NAME
R2_PUBLIC_URL=https://pub-YOUR_BUCKET_ID.r2.dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=YOUR_16_CHAR_PASSWORD

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLOUDFLARE_PROJECT_NAME=my-portfolio-cms
EMAIL_PROVIDER=gmail
```

---

## 🚀 Common Tasks

### Start Development
```bash
npm run dev
```

### Check Database
```bash
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM projects;"
```

### Check R2 Files
```bash
wrangler r2 object list YOUR_BUCKET_NAME
```

### Check Users
```bash
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT email, name, role FROM users;"
```

### Build for Production
```bash
npm run build
```

---

## 📊 Verification Checklist

- [ ] Database created with custom name
- [ ] Database ID saved
- [ ] Bucket created with custom name
- [ ] R2 API token created
- [ ] Public URL obtained
- [ ] wrangler.toml updated
- [ ] .env.local created
- [ ] package.json scripts updated (optional)
- [ ] Schema applied to database
- [ ] Admin user created
- [ ] Can login to CMS
- [ ] Can upload files to R2

---

## 🔗 Useful Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **R2 Management:** https://dash.cloudflare.com/ → R2
- **D1 Databases:** https://dash.cloudflare.com/ → Workers & Pages → D1
- **API Tokens:** https://dash.cloudflare.com/profile/api-tokens
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

---

## 💾 Backup Your Configuration

**IMPORTANT:** Save these values securely!

```
Database Name:     _______________________________
Database ID:       _______________________________
Bucket Name:       _______________________________
Account ID:        _______________________________
API Token:         _______________________________
R2 Access Key:     _______________________________
R2 Secret Key:     _______________________________
R2 Public URL:     _______________________________
Admin Email:       _______________________________
Admin Password:    _______________________________
NextAuth Secret:   _______________________________
Gmail User:        _______________________________
Gmail App Pass:    _______________________________
```

---

## 🆘 Troubleshooting

### Database not found
```bash
# Check if database exists
wrangler d1 list

# Verify database ID in wrangler.toml matches .env.local
```

### Bucket not found
```bash
# Check if bucket exists
wrangler r2 bucket list

# Verify bucket name in .env.local
```

### Cannot login
```bash
# Check if admin user exists
wrangler d1 execute YOUR_DATABASE_NAME --remote --command="SELECT * FROM users;"

# Verify password is hashed (should start with $2a$10$)
```

### R2 upload fails
```bash
# Check R2 credentials
wrangler r2 object list YOUR_BUCKET_NAME

# Verify CORS is configured
wrangler r2 bucket cors get YOUR_BUCKET_NAME
```

---

## 📚 Documentation

- `CUSTOM_SETUP_GUIDE.md` - Detailed setup instructions
- `FRESH_SETUP_GUIDE.md` - Alternative setup guide
- `QUICK_START.md` - Quick start guide
- `COMPLETE_FEATURES_GUIDE.md` - All features explained

---

**Keep this file updated with your actual configuration!** 📝
