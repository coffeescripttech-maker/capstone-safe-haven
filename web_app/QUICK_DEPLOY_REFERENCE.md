# ⚡ Quick Deploy Reference Card

## 🎯 Deploy in 3 Steps

### Step 1: Push to GitHub
```powershell
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Configure in Cloudflare
1. Go to: https://dash.cloudflare.com
2. Workers & Pages → Create → Pages → Connect Git
3. Select your repository

**Build Settings:**
```
Framework: Next.js
Build: npm run build
Output: .next
Deploy: [EMPTY]
```

**Environment Variables:**
```
NEXTAUTH_URL=https://dubai-filmmaker-cms.pages.dev
NEXTAUTH_SECRET=[32-char-secret]
R2_PUBLIC_URL=https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev
ENVIRONMENT=production
```

### Step 3: Add Bindings & Redeploy
1. Settings → Functions → Bindings
2. Add D1: `DB` → `dubai-filmmaker-cms`
3. Add R2: `dubailfilmmaker` → `dubailfilmmaker`
4. Deployments → Retry deployment

---

## 🔑 Quick Info

**Your URL:** `https://dubai-filmmaker-cms.pages.dev`

**Login:** `admin@example.com` / `admin123`

**Time:** 15-20 minutes

---

## 📚 Full Guides

- **Complete Guide:** `CLOUDFLARE_DEPLOYMENT_COMPLETE_GUIDE.md`
- **Checklist:** `DEPLOYMENT_QUICK_CHECKLIST.md`
- **Visual Guide:** `DEPLOYMENT_VISUAL_GUIDE.md`
- **Summary:** `DEPLOYMENT_SUMMARY.md`

---

## 🆘 Common Issues

**Build fails?**
- Check build command: `npm run build`
- Check output: `.next`

**Can't login?**
- Check `NEXTAUTH_URL` matches your URL
- Check `NEXTAUTH_SECRET` is set

**Database errors?**
- Add D1 binding: `DB`
- Redeploy

**Upload errors?**
- Add R2 binding: `dubailfilmmaker`
- Check `R2_PUBLIC_URL`

---

## ✅ Success Checklist

- [ ] Site loads
- [ ] Can login
- [ ] Dashboard works
- [ ] Can create project
- [ ] Can upload file
- [ ] All pages accessible

---

**That's it! You're ready to deploy! 🚀**
