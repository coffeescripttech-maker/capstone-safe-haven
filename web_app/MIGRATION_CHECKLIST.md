# 🔄 Migration Checklist - Fresh Instance Setup

Use this checklist to track your progress setting up new instances.

---

## 📋 Pre-Migration Checklist

- [ ] Backed up existing data (if any)
- [ ] Installed Node.js 18+
- [ ] Installed Wrangler CLI: `npm install -g wrangler`
- [ ] Have Cloudflare account ready
- [ ] Have Gmail account ready (for emails)
- [ ] Read `FRESH_SETUP_GUIDE.md`

---

## 🔐 Step 1: Cloudflare Authentication

- [ ] Logged in to Cloudflare: `wrangler login`
- [ ] Got Account ID: `wrangler whoami`
- [ ] Saved Account ID to notes

**Account ID:** `_______________________________`

---

## 🗄️ Step 2: Cloudflare D1 Database

- [ ] Created database: `wrangler d1 create dubai-filmmaker-cms`
- [ ] Saved Database ID to notes
- [ ] Updated `wrangler.toml` with database_id
- [ ] Applied projects schema: `wrangler d1 execute dubai-filmmaker-cms --remote --file=database/d1-schema.sql`
- [ ] Applied users schema: `wrangler d1 execute dubai-filmmaker-cms --remote --file=database/users-schema.sql`
- [ ] Applied header schema: `wrangler d1 execute dubai-filmmaker-cms --remote --file=database/update-header-config.sql`
- [ ] Seeded sample projects: `wrangler d1 execute dubai-filmmaker-cms --remote --file=database/insert_projects_d1.sql`
- [ ] Verified database: `npm run db:console`

**Database ID:** `_______________________________`

---

## 📦 Step 3: Cloudflare R2 Storage

- [ ] Created bucket: `wrangler r2 bucket create dubai-filmmaker-assets`
- [ ] Enabled public access: `wrangler r2 bucket update dubai-filmmaker-assets --public-access`
- [ ] Created R2 API Token at: https://dash.cloudflare.com/
- [ ] Saved Access Key ID
- [ ] Saved Secret Access Key
- [ ] Got Public Bucket URL from dashboard
- [ ] Configured CORS (optional): `wrangler r2 bucket cors put dubai-filmmaker-assets --config=r2-cors-config.json`
- [ ] Verified bucket: `npm run r2:list`

**R2 Access Key ID:** `_______________________________`

**R2 Secret Key:** `_______________________________`

**R2 Public URL:** `https://pub-____________.r2.dev`

---

## 🔑 Step 4: Cloudflare API Token

- [ ] Created API Token at: https://dash.cloudflare.com/profile/api-tokens
- [ ] Set permissions: D1 Edit, R2 Edit
- [ ] Saved API Token

**API Token:** `_______________________________`

---

## 🔐 Step 5: NextAuth Secret

- [ ] Generated secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] Saved secret (44 characters)

**NextAuth Secret:** `_______________________________`

---

## 📧 Step 6: Gmail Setup

- [ ] Enabled 2FA on Gmail account
- [ ] Created App Password at: https://myaccount.google.com/apppasswords
- [ ] Saved Gmail address
- [ ] Saved App Password (16 characters)

**Gmail Address:** `_______________________________`

**App Password:** `_______________________________`

---

## 👤 Step 7: Admin User

- [ ] Chose secure admin password
- [ ] Hashed password with bcrypt
- [ ] Created admin user in database
- [ ] Verified user exists: `npm run db:users:list`

**Admin Email:** `_______________________________`

**Admin Password:** `_______________________________` (Keep secure!)

---

## 🌐 Step 8: Web Analytics (Optional)

- [ ] Created Web Analytics site at: https://dash.cloudflare.com/
- [ ] Got Site ID from JavaScript snippet
- [ ] Saved Site ID

**Site ID:** `_______________________________`

---

## 📝 Step 9: Environment Variables

- [ ] Copied `.env.local.template` to `.env.local`
- [ ] Filled in NEXTAUTH_URL
- [ ] Filled in NEXTAUTH_SECRET
- [ ] Filled in R2_ENDPOINT
- [ ] Filled in R2_ACCESS_KEY_ID
- [ ] Filled in R2_SECRET_ACCESS_KEY
- [ ] Filled in R2_BUCKET_NAME
- [ ] Filled in R2_PUBLIC_URL
- [ ] Filled in CLOUDFLARE_ACCOUNT_ID
- [ ] Filled in CLOUDFLARE_API_TOKEN
- [ ] Filled in CLOUDFLARE_DATABASE_ID
- [ ] Filled in GMAIL_USER
- [ ] Filled in GMAIL_APP_PASSWORD
- [ ] Verified `.env.local` is in `.gitignore`

---

## ✅ Step 10: Verification

- [ ] Ran verification script: `verify-setup.bat`
- [ ] All checks passed
- [ ] Installed dependencies: `npm install`
- [ ] Started dev server: `npm run dev`
- [ ] Opened: http://localhost:3000
- [ ] Successfully logged in at: http://localhost:3000/auth/signin
- [ ] Can view projects page
- [ ] Can create new project
- [ ] Can upload files to R2

---

## 🔗 Step 11: Portfolio Website Integration

- [ ] Updated `final_portfolio_website/assets/js/data-loader.js`
- [ ] Set `CMS_BASE_URL` to CMS URL
- [ ] Tested API endpoints:
  - [ ] http://localhost:3000/api/public/projects
  - [ ] http://localhost:3000/api/public/about
  - [ ] http://localhost:3000/api/public/contact
  - [ ] http://localhost:3000/api/public/header
- [ ] Portfolio website fetches data successfully
- [ ] Projects display on portfolio website
- [ ] Header logo displays correctly

---

## 🚀 Step 12: Production Deployment (Optional)

### CMS Deployment

- [ ] Updated `NEXTAUTH_URL` to production URL
- [ ] Updated `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Built project: `npm run build`
- [ ] Deployed to Vercel/Cloudflare Pages
- [ ] Configured environment variables in hosting platform
- [ ] Configured D1 binding (if using Cloudflare Pages)
- [ ] Configured R2 binding (if using Cloudflare Pages)
- [ ] Tested production login
- [ ] Tested production API endpoints

### Portfolio Website Deployment

- [ ] Updated `CMS_BASE_URL` to production CMS URL
- [ ] Deployed to Vercel
- [ ] Tested portfolio website loads
- [ ] Tested data fetches from production CMS
- [ ] Verified images load from R2
- [ ] Tested on mobile devices

---

## 🔒 Security Checklist

- [ ] Changed default admin password
- [ ] Used strong password (12+ characters, mixed case, numbers, symbols)
- [ ] Generated unique NEXTAUTH_SECRET
- [ ] Never committed `.env.local` to Git
- [ ] Restricted API tokens to minimum permissions
- [ ] Enabled 2FA on Cloudflare account
- [ ] Enabled 2FA on Gmail account
- [ ] Reviewed CORS settings on R2 bucket
- [ ] Set appropriate session expiry (30 days default)

---

## 📊 Post-Migration Testing

### CMS Testing

- [ ] Login/logout works
- [ ] Create project works
- [ ] Edit project works
- [ ] Delete project works
- [ ] Upload image works
- [ ] Upload video works
- [ ] Bulk operations work
- [ ] Export to CSV works
- [ ] Export to JSON works
- [ ] Filters work correctly
- [ ] Search works correctly
- [ ] Header settings work
- [ ] Logo upload works

### Portfolio Website Testing

- [ ] Homepage loads
- [ ] Projects display correctly
- [ ] Project detail pages work
- [ ] About page displays
- [ ] Contact page displays
- [ ] Header logo displays
- [ ] Videos play on hover
- [ ] Category filters work
- [ ] Mobile responsive
- [ ] Images load from R2

---

## 📚 Documentation Review

- [ ] Read `FRESH_SETUP_GUIDE.md`
- [ ] Read `QUICK_START.md`
- [ ] Read `COMPLETE_FEATURES_GUIDE.md`
- [ ] Read `PUBLIC_API_ENDPOINTS.md`
- [ ] Read `HEADER_SETTINGS_GUIDE.md`
- [ ] Bookmarked Cloudflare dashboard
- [ ] Bookmarked Wrangler docs

---

## 🎯 Final Checklist

- [ ] All services created and configured
- [ ] All credentials saved securely
- [ ] `.env.local` file complete
- [ ] Database schema applied
- [ ] Sample data seeded
- [ ] Admin user created
- [ ] CMS login works
- [ ] Portfolio website connects to CMS
- [ ] All features tested
- [ ] Production deployment complete (if applicable)
- [ ] Documentation reviewed

---

## 📝 Notes & Issues

Use this space to track any issues or notes during migration:

```
Date: ___________
Issue: 
Solution:

Date: ___________
Issue:
Solution:

Date: ___________
Issue:
Solution:
```

---

## 🆘 Troubleshooting Resources

If you encounter issues:

1. **Check logs:**
   - CMS: Browser console (F12)
   - Database: `npm run db:console`
   - R2: `npm run r2:list`

2. **Verify credentials:**
   - Run: `verify-setup.bat`
   - Check `.env.local` values

3. **Common issues:**
   - Database connection: Check `CLOUDFLARE_DATABASE_ID` and `CLOUDFLARE_API_TOKEN`
   - R2 upload: Check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
   - Login: Check admin user exists and password is hashed
   - Email: Check Gmail App Password (16 chars, no spaces)

4. **Documentation:**
   - `FRESH_SETUP_GUIDE.md` - Detailed setup instructions
   - `QUICK_START.md` - Quick reference
   - `COMPLETE_FEATURES_GUIDE.md` - Feature documentation

5. **External resources:**
   - Cloudflare Docs: https://developers.cloudflare.com/
   - Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/
   - NextAuth Docs: https://next-auth.js.org/

---

## ✅ Migration Complete!

Once all items are checked, your migration is complete! 🎉

**Next steps:**
1. Start creating content in the CMS
2. Customize the portfolio website
3. Deploy to production
4. Monitor analytics
5. Maintain and update regularly

**Congratulations on your new setup!** 🚀
