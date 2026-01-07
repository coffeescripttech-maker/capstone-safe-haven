# ✅ Cloudflare Pages Deployment - Quick Checklist

## Before You Start

- [x] Code is ready and tested locally
- [x] Build completes successfully (`npm run build`)
- [x] wrangler.toml is configured correctly
- [ ] Code is pushed to GitHub

---

## Deployment Steps

### 1. Cloudflare Dashboard Setup
- [ ] Go to https://dash.cloudflare.com
- [ ] Click Workers & Pages → Create application
- [ ] Select **Pages** tab
- [ ] Click Connect to Git
- [ ] Select your GitHub repository

### 2. Build Configuration
- [ ] Framework: **Next.js**
- [ ] Build command: **npm run build**
- [ ] Build output: **.next**
- [ ] Root directory: **final_cms** (or leave empty)
- [ ] Deploy command: **LEAVE EMPTY**

### 3. Environment Variables
- [ ] NEXTAUTH_URL = `https://dubai-filmmaker-cms.pages.dev`
- [ ] NEXTAUTH_SECRET = `[generate-secure-32-char-string]`
- [ ] R2_PUBLIC_URL = `https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev`
- [ ] ENVIRONMENT = `production`

### 4. First Deployment
- [ ] Click "Save and Deploy"
- [ ] Wait for build to complete (2-4 minutes)
- [ ] Note your Pages URL

### 5. Configure Bindings
- [ ] Go to Settings → Functions → Bindings
- [ ] Add D1 binding: Variable `DB` → Database `dubai-filmmaker-cms`
- [ ] Add R2 binding: Variable `dubailfilmmaker` → Bucket `dubailfilmmaker`
- [ ] Click Save

### 6. Redeploy
- [ ] Go to Deployments tab
- [ ] Click "Retry deployment" on latest deployment
- [ ] Wait for build to complete

---

## Testing

- [ ] Visit your Pages URL
- [ ] Go to `/signin`
- [ ] Login with `admin@example.com` / `admin123`
- [ ] Should redirect to dashboard
- [ ] Test creating a project
- [ ] Test uploading an image
- [ ] Test user management

---

## If Something Goes Wrong

### Build Fails
- Check build logs in Cloudflare dashboard
- Verify build command is `npm run build`
- Verify output directory is `.next`

### Can't Login
- Check NEXTAUTH_URL matches your Pages URL exactly
- Verify NEXTAUTH_SECRET is set
- Check browser console for errors

### Database Errors
- Verify D1 binding is added (variable name: `DB`)
- Redeploy after adding binding

### Upload Errors
- Verify R2 binding is added (variable name: `dubailfilmmaker`)
- Verify R2_PUBLIC_URL is set
- Redeploy after adding binding

---

## Quick Commands

### Generate NEXTAUTH_SECRET (PowerShell):
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Test Build Locally:
```powershell
cd final_cms
npm run build
```

### CLI Deployment (Alternative):
```powershell
wrangler login
npm run deploy
```

---

## Success Indicators

✅ Build completes without errors
✅ Site loads at Pages URL
✅ Can login successfully
✅ Dashboard displays correctly
✅ Can create/edit projects
✅ File uploads work
✅ All pages accessible

---

## Next Steps After Deployment

1. Change default passwords
2. Add your custom domain (optional)
3. Test all features thoroughly
4. Set up monitoring/analytics
5. Configure backup strategy

---

**Full Guide:** See `CLOUDFLARE_DEPLOYMENT_COMPLETE_GUIDE.md`
