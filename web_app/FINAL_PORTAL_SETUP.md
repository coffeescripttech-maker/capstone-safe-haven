# ✅ Final Cloudflare Pages Portal Setup

## 🎉 You're in the Right Place!

Good news - you're now in the **Pages** section (not Workers). The build succeeded!

---

## 📋 Exact Configuration for Portal

When setting up in Cloudflare Pages dashboard, use these **exact** settings:

### Project Settings
```
Project name: dubai-filmmaker-cms
Production branch: main
```

### Build Configuration
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory (path): final_cms
```

### Build Settings - Advanced (Optional)
```
Node version: 18
Install command: npm install
```

---

## ⚠️ Important: Build Output Directory

The error you saw was because `wrangler.toml` had the wrong output directory.

**Fixed:** Changed from `.vercel/output/static` to `.next`

**For Portal:** Just set it to `.next` in the dashboard - that's where Next.js builds to.

---

## 🔐 Environment Variables

After connecting your repository, add these in the portal:

**Go to:** Settings → Environment variables → Production

| Variable | Value |
|----------|-------|
| `NEXTAUTH_URL` | `https://dubai-filmmaker-cms.pages.dev` |
| `NEXTAUTH_SECRET` | Generate a 32-character secret |
| `R2_PUBLIC_URL` | `https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev` |
| `ENVIRONMENT` | `production` |

**Generate NEXTAUTH_SECRET:**
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Or use: https://generate-secret.vercel.app/32

---

## 🔗 Bindings (After First Deployment)

**Go to:** Settings → Functions → Bindings

### Add D1 Database
1. Click "Add binding"
2. Select "D1 database"
3. Variable name: `DB`
4. D1 database: `dubai-filmmaker-cms`
5. Click "Save"

### Add R2 Bucket
1. Click "Add binding"
2. Select "R2 bucket"
3. Variable name: `dubailfilmmaker`
4. R2 bucket: `dubai-filmmaker-assets`
5. Click "Save"

---

## 🚀 Deployment Steps

### Step 1: Initial Deployment
1. Connect your GitHub repository
2. Configure build settings (see above)
3. Add environment variables
4. Click "Save and Deploy"
5. Wait for build to complete (~2-3 minutes)

### Step 2: Add Bindings
1. After first deployment succeeds
2. Go to Settings → Functions → Bindings
3. Add D1 database binding
4. Add R2 bucket binding
5. Click "Save"

### Step 3: Redeploy
1. Go to Deployments tab
2. Click "Retry deployment" on the latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 4: Test
1. Visit your Pages URL
2. Login with: `admin@example.com` / `admin123`
3. Test all features

---

## ✅ Build Success Indicators

Your build log should show:
```
✓ Compiled successfully in 9.1s
✓ Running TypeScript
✓ Collecting page data using 3 workers
✓ Generating static pages using 3 workers (32/32)
✓ Finalizing page optimization

Route (app)
├ ○ / (and 31 other routes)
└ ƒ /api/... (11 API routes)

Finished
```

---

## 🎯 Quick Checklist

### Before Deployment
- [x] Code pushed to GitHub
- [x] Repository connected to Cloudflare Pages
- [x] Build settings configured
- [x] Environment variables added

### After First Deployment
- [ ] Deployment succeeded
- [ ] Got your Pages URL
- [ ] Added D1 binding
- [ ] Added R2 binding
- [ ] Redeployed

### Testing
- [ ] Site loads
- [ ] Can login
- [ ] Projects page works
- [ ] Can create project
- [ ] File uploads work
- [ ] User management works

---

## 🔧 Troubleshooting

### "Output directory not found"
**Fixed!** The wrangler.toml now points to `.next` (correct directory)

### Build succeeds but site doesn't work
**Solution:** Add environment variables and bindings, then redeploy

### Can't login
**Solution:** 
1. Check NEXTAUTH_URL matches your Pages URL
2. Verify NEXTAUTH_SECRET is set
3. Run database migrations locally:
   ```bash
   npm run db:migrate
   npm run db:seed
   npm run db:users:setup
   ```

### Images don't load
**Solution:** Add R2 binding in Settings → Functions → Bindings

---

## 📊 Expected URLs

After deployment, you'll get:
- **Production:** `https://dubai-filmmaker-cms.pages.dev`
- **Preview (branches):** `https://[branch-name].dubai-filmmaker-cms.pages.dev`
- **Custom domain:** `https://cms.dubaifilmmaker.ae` (if configured)

---

## 🎨 Custom Domain (Optional)

1. Go to your Pages project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter: `cms.dubaifilmmaker.ae`
5. Cloudflare automatically configures DNS
6. Wait for SSL certificate (a few minutes)

---

## 🔄 Automatic Deployments

Now every time you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push
```

Cloudflare Pages automatically:
1. Detects the push
2. Builds your application
3. Deploys to production
4. Updates your live site

---

## 📝 Summary

**What's Fixed:**
- ✅ wrangler.toml now points to correct output directory (`.next`)
- ✅ Build configuration is correct
- ✅ Ready for portal deployment

**What to Do:**
1. Set build output to `.next` in portal
2. Add environment variables
3. Deploy
4. Add bindings
5. Redeploy
6. Test!

---

## 🎉 You're Ready!

Everything is configured correctly. Just follow the steps above in the Cloudflare Pages portal and your CMS will be live! 🚀

**Next:** Push your changes and deploy through the portal!
