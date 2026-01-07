# 🚀 Deploy via GitHub + Cloudflare Pages (Recommended)

## Why This Method is Best
- ✅ **Automatic deployments** on every git push
- ✅ **No CLI authentication issues**
- ✅ **Preview deployments** for branches
- ✅ **Easy rollbacks** to previous versions
- ✅ **Built-in CI/CD** pipeline

---

## 📋 Prerequisites

1. Your code is in a Git repository
2. Repository is pushed to GitHub (or GitLab/Bitbucket)
3. You have a Cloudflare account

---

## 🎯 Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Cloudflare Pages deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/your-repo.git

# Push to GitHub
git push -u origin main
```

### Step 2: Go to Cloudflare Dashboard

1. Navigate to https://dash.cloudflare.com
2. Select your account
3. Click **Workers & Pages** in the left sidebar
4. Click **Create application**
5. Select the **Pages** tab
6. Click **Connect to Git**

### Step 3: Connect Your Repository

1. **Select Git provider:** GitHub (or GitLab/Bitbucket)
2. **Authorize Cloudflare** to access your repositories
3. **Select your repository** from the list
4. Click **Begin setup**

### Step 4: Configure Build Settings

**IMPORTANT:** Use these exact settings:

```
Project name: dubai-filmmaker-cms
Production branch: main
```

**Build settings:**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: final_cms
```

**⚠️ CRITICAL - Deploy Command:**
```
LEAVE THIS EMPTY or DELETE IT
```

**DO NOT use:** `npx wrangler deploy` ❌

The deploy command field should be **completely empty** for Next.js on Pages.

### Step 5: Environment Variables

Click **Add environment variable** and add these:

**Production:**
```
NEXTAUTH_URL = https://dubai-filmmaker-cms.pages.dev
NEXTAUTH_SECRET = your-secure-secret-key-here
R2_PUBLIC_URL = https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev
ENVIRONMENT = production
```

**How to generate NEXTAUTH_SECRET:**
```bash
# In PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Or use this online: https://generate-secret.vercel.app/32
```

### Step 6: Save and Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete (2-3 minutes)
3. You'll get a URL like: `https://dubai-filmmaker-cms.pages.dev`

### Step 7: Configure Bindings

After first deployment:

1. Go to your project in Cloudflare Dashboard
2. Click **Settings** → **Functions**
3. Scroll to **Bindings**

**Add D1 Database Binding:**
- Click **Add binding**
- Type: `D1 database`
- Variable name: `DB`
- D1 database: `dubai-filmmaker-cms`
- Click **Save**

**Add R2 Bucket Binding:**
- Click **Add binding**
- Type: `R2 bucket`
- Variable name: `dubailfilmmaker`
- R2 bucket: `dubai-filmmaker-assets`
- Click **Save**

### Step 8: Trigger Redeploy

After adding bindings:

1. Go to **Deployments** tab
2. Click **Retry deployment** on the latest deployment
3. Or push a new commit to trigger automatic deployment

---

## 🎨 Custom Domain (Optional)

### Add Your Domain

1. Go to your Pages project
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain: `cms.dubaifilmmaker.ae`
5. Click **Continue**
6. Cloudflare will automatically configure DNS

---

## 🔄 Automatic Deployments

Now every time you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Cloudflare Pages will automatically:
1. Detect the push
2. Build your application
3. Deploy to production
4. Update your live site

---

## 🌿 Preview Deployments

For testing before production:

```bash
# Create a new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature
```

Cloudflare will create a **preview deployment** with a unique URL like:
```
https://feature-new-feature.dubai-filmmaker-cms.pages.dev
```

Test your changes, then merge to main for production deployment.

---

## 📊 Build Configuration Summary

Copy these settings exactly:

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | `final_cms` |
| **Deploy command** | **(EMPTY)** |
| **Node version** | 18 or higher |

---

## 🔐 Environment Variables Reference

### Production Environment

```bash
# Authentication
NEXTAUTH_URL=https://dubai-filmmaker-cms.pages.dev
NEXTAUTH_SECRET=your-32-character-secret-here

# Storage
R2_PUBLIC_URL=https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev

# Environment
ENVIRONMENT=production
```

### Preview Environment (Optional)

Same as production, but change:
```bash
NEXTAUTH_URL=https://preview.dubai-filmmaker-cms.pages.dev
ENVIRONMENT=preview
```

---

## 🔗 Bindings Configuration

### D1 Database Binding
```
Variable name: DB
D1 database: dubai-filmmaker-cms
Database ID: 908f42f0-ad4d-4ce0-b3a2-9bb13cf54795
```

### R2 Bucket Binding
```
Variable name: dubailfilmmaker
R2 bucket: dubai-filmmaker-assets
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Build fails with "command not found"
**Cause:** Wrong build command
**Solution:** Use exactly `npm run build` (not `npx wrangler deploy`)

### Issue 2: "wrangler deploy" error
**Cause:** Deploy command is set
**Solution:** Remove/delete the deploy command field completely

### Issue 3: Site loads but shows errors
**Cause:** Missing environment variables or bindings
**Solution:** 
1. Add all environment variables
2. Add D1 and R2 bindings
3. Redeploy

### Issue 4: Can't login to CMS
**Cause:** Database not initialized
**Solution:** Run migrations locally:
```bash
npm run db:migrate
npm run db:seed
npm run db:users:setup
```

### Issue 5: Images don't load
**Cause:** R2 binding not configured
**Solution:** Add R2 binding in Settings → Functions → Bindings

---

## 📝 Post-Deployment Checklist

After your first successful deployment:

- [ ] Site is accessible at Pages URL
- [ ] Environment variables are set
- [ ] D1 database binding is configured
- [ ] R2 bucket binding is configured
- [ ] Redeployed after adding bindings
- [ ] Can login with admin credentials
- [ ] Database migrations completed
- [ ] Test project creation
- [ ] Test file uploads
- [ ] Test user management
- [ ] Custom domain configured (optional)

---

## 🎯 Deployment Workflow

### For New Features

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# 4. Test preview deployment
# Visit: https://feature-my-feature.dubai-filmmaker-cms.pages.dev

# 5. Merge to main when ready
git checkout main
git merge feature/my-feature
git push origin main

# 6. Production automatically deploys!
```

---

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)

---

## ✅ Advantages of GitHub Deployment

1. **No CLI issues** - Everything through web dashboard
2. **Automatic deployments** - Push to deploy
3. **Preview deployments** - Test before production
4. **Easy rollbacks** - One-click rollback to any version
5. **Build logs** - See exactly what happened
6. **Team collaboration** - Multiple developers can deploy
7. **Git history** - Track all changes
8. **Branch deployments** - Test features in isolation

---

## 🎉 You're All Set!

With GitHub deployment:
1. Push your code to GitHub
2. Connect to Cloudflare Pages
3. Configure build settings (no deploy command!)
4. Add environment variables and bindings
5. Every push automatically deploys

This is the **recommended production setup** for your CMS! 🚀
