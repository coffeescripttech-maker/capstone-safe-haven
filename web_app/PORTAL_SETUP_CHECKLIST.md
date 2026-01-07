# ✅ Cloudflare Pages Portal Setup Checklist

## 🎯 Quick Reference for Portal Configuration

Use this checklist when setting up your project in the Cloudflare Pages dashboard.

---

## 📋 Build Configuration

### Framework Settings
```
✅ Framework preset: Next.js
✅ Build command: npm run build
✅ Build output directory: .next
✅ Root directory: final_cms
```

### Deploy Command
```
❌ Deploy command: LEAVE EMPTY (delete if present)
```

**CRITICAL:** Do NOT use `npx wrangler deploy` - this causes errors!

---

## 🔐 Environment Variables

Go to: **Settings** → **Environment variables** → **Add variable**

### Production Variables

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXTAUTH_URL` | `https://your-project.pages.dev` | Use your actual Pages URL |
| `NEXTAUTH_SECRET` | `[generate-32-char-secret]` | Use secure random string |
| `R2_PUBLIC_URL` | `https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev` | Your R2 public URL |
| `ENVIRONMENT` | `production` | Environment identifier |

**Generate NEXTAUTH_SECRET:**
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Or use: https://generate-secret.vercel.app/32

---

## 🔗 Function Bindings

Go to: **Settings** → **Functions** → **Bindings** → **Add binding**

### D1 Database Binding

```
✅ Type: D1 database
✅ Variable name: DB
✅ D1 database: dubai-filmmaker-cms
```

### R2 Bucket Binding

```
✅ Type: R2 bucket
✅ Variable name: dubailfilmmaker
✅ R2 bucket: dubai-filmmaker-assets
```

---

## 🚀 Deployment Steps

### Step 1: Initial Setup
- [ ] Connect GitHub repository
- [ ] Configure build settings (see above)
- [ ] Add environment variables
- [ ] Click "Save and Deploy"

### Step 2: After First Deployment
- [ ] Go to Settings → Functions → Bindings
- [ ] Add D1 database binding
- [ ] Add R2 bucket binding
- [ ] Click "Save"

### Step 3: Redeploy
- [ ] Go to Deployments tab
- [ ] Click "Retry deployment" on latest
- [ ] Wait for completion

### Step 4: Test
- [ ] Visit your Pages URL
- [ ] Login with: `admin@example.com` / `admin123`
- [ ] Test project creation
- [ ] Test file uploads
- [ ] Test user management

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T DO THIS:
- Setting deploy command to `npx wrangler deploy`
- Using `out` or `.vercel/output/static` as build output
- Forgetting to add bindings after first deployment
- Using wrong variable names for bindings

### ✅ DO THIS:
- Leave deploy command EMPTY
- Use `.next` as build output directory
- Add bindings after first successful deployment
- Use exact variable names: `DB` and `dubailfilmmaker`

---

## 🔄 After Configuration Changes

Whenever you change environment variables or bindings:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **Retry deployment**
4. Wait for new deployment to complete

---

## 📊 Expected Build Output

Your build should show:

```
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages (32/32)
✓ Finalizing page optimization

Success: Build command completed
```

If you see errors about `wrangler deploy`, your deploy command is set incorrectly.

---

## 🎯 Quick Copy-Paste Values

### Build Settings
```
Framework: Next.js
Build: npm run build
Output: .next
Root: final_cms
Deploy: [EMPTY]
```

### Environment Variables
```
NEXTAUTH_URL=https://dubai-filmmaker-cms.pages.dev
NEXTAUTH_SECRET=[your-secret]
R2_PUBLIC_URL=https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev
ENVIRONMENT=production
```

### Bindings
```
D1: DB → dubai-filmmaker-cms
R2: dubailfilmmaker → dubai-filmmaker-assets
```

---

## 🆘 Troubleshooting

### Build Fails
- Check build command is exactly `npm run build`
- Verify root directory is `final_cms`
- Check build output is `.next`

### Deploy Command Error
- Delete/remove the deploy command field
- It should be completely empty

### Site Doesn't Work
- Add all environment variables
- Add both bindings (D1 and R2)
- Redeploy after configuration

### Can't Login
- Check NEXTAUTH_URL matches your Pages URL
- Verify NEXTAUTH_SECRET is set
- Run database migrations locally

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Build succeeds without errors
- [ ] Deploy command is EMPTY
- [ ] All 4 environment variables are set
- [ ] D1 binding is configured
- [ ] R2 binding is configured
- [ ] Redeployed after adding bindings
- [ ] Can access the site
- [ ] Can login successfully
- [ ] Projects page works
- [ ] File uploads work
- [ ] User management works

---

## 🎉 Success!

When everything is configured correctly:
- ✅ Every git push automatically deploys
- ✅ Preview deployments for branches
- ✅ Easy rollbacks to previous versions
- ✅ No CLI authentication issues
- ✅ Full CI/CD pipeline

---

## 📚 Related Guides

- **GITHUB_DEPLOYMENT_GUIDE.md** - Complete GitHub setup
- **CLOUDFLARE_PAGES_DEPLOYMENT.md** - Detailed deployment guide
- **READY_TO_DEPLOY.md** - Quick start guide
