# Fix Cloudflare Pages Deployment Configuration

## ❌ Current Error
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## 🔍 Root Cause
Your Cloudflare Pages project is configured with a **custom deploy command** that uses `npx wrangler deploy` (Workers command) instead of letting Pages handle deployment automatically.

---

## ✅ Solution: Update Cloudflare Pages Settings

### Step 1: Go to Cloudflare Dashboard
1. Navigate to https://dash.cloudflare.com
2. Select your account
3. Go to **Workers & Pages**
4. Find your project: `dubai-filmmaker-cms`
5. Click on the project name

### Step 2: Update Build Settings
1. Click **Settings** tab
2. Scroll to **Build & deployments** section
3. Click **Edit configuration**

### Step 3: Configure Build Settings

**Framework preset:** `Next.js`

**Build command:**
```bash
npm run build
```

**Build output directory:**
```
.next
```

**Root directory (if needed):**
```
final_cms
```

**Deploy command:** 
```
LEAVE THIS EMPTY or DELETE IT
```
⚠️ **Important:** Remove any custom deploy command like `npx wrangler deploy`

### Step 4: Save Changes
Click **Save** and trigger a new deployment

---

## 🚀 Alternative: Deploy from Command Line

If you want to deploy from your local machine instead:

### Option 1: Using npm script
```bash
cd final_cms
npm run deploy
```

### Option 2: Using wrangler directly
```bash
cd final_cms
npm run build
npx wrangler pages deploy .next --project-name=dubai-filmmaker-cms
```

### Option 3: Using deployment script
**Windows:**
```bash
cd final_cms
scripts\deploy-pages.bat
```

**Linux/Mac:**
```bash
cd final_cms
chmod +x scripts/deploy-pages.sh
./scripts/deploy-pages.sh
```

---

## 📋 Complete Cloudflare Pages Configuration

### Build Configuration
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: final_cms (if in subdirectory)
Node version: 18 or higher
```

### Environment Variables
Go to **Settings** → **Environment variables** and add:

**Production:**
```
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-secret-key-here
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
ENVIRONMENT=production
```

**Preview (optional):**
```
NEXTAUTH_URL=https://preview-branch.your-project.pages.dev
NEXTAUTH_SECRET=same-as-production
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
ENVIRONMENT=preview
```

### Function Bindings
Go to **Settings** → **Functions** → **Bindings**

**D1 Database:**
- Variable name: `DB`
- D1 database: `dubai-filmmaker-cms`

**R2 Bucket:**
- Variable name: `dubailfilmmaker`
- R2 bucket: `dubailfilmmaker`

---

## 🔧 Troubleshooting

### Issue 1: Still getting "wrangler deploy" error
**Solution:** Make sure you've removed the custom deploy command in Pages settings. The deploy command field should be empty.

### Issue 2: Build fails with "command not found"
**Solution:** Ensure build command is exactly `npm run build` (not `npx wrangler deploy`)

### Issue 3: Pages not finding .next directory
**Solution:** Verify build output directory is set to `.next` (not `out` or `.vercel/output/static`)

### Issue 4: Environment variables not working
**Solution:** 
1. Add them in Pages Settings → Environment variables
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Issue 5: Database/R2 not accessible
**Solution:**
1. Add bindings in Settings → Functions → Bindings
2. Ensure binding names match your code (`DB` and `dubailfilmmaker`)
3. Redeploy after adding bindings

---

## 📝 Deployment Checklist

### Before First Deployment
- [ ] Remove custom deploy command from Pages settings
- [ ] Set build command to `npm run build`
- [ ] Set build output to `.next`
- [ ] Add all environment variables
- [ ] Configure D1 database binding
- [ ] Configure R2 bucket binding

### After Configuration
- [ ] Trigger new deployment
- [ ] Wait for build to complete
- [ ] Test the deployed site
- [ ] Verify authentication works
- [ ] Test database operations
- [ ] Test file uploads to R2

---

## 🎯 Recommended Deployment Method

**For automatic deployments (recommended):**
1. Connect your Git repository to Cloudflare Pages
2. Configure build settings as shown above
3. Every push to main branch automatically deploys
4. Preview deployments for other branches

**For manual deployments:**
```bash
cd final_cms
npm run deploy
```

---

## 📚 Key Points

1. **Never use `wrangler deploy`** - That's for Workers, not Pages
2. **Use `wrangler pages deploy`** - Or let Pages handle it automatically
3. **Remove custom deploy commands** - Let Cloudflare Pages manage deployment
4. **Configure bindings in dashboard** - D1 and R2 need to be bound to your Pages project
5. **Set environment variables** - Required for authentication and configuration

---

## ✅ Expected Result

After fixing the configuration, you should see:
```
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
Success: Build command completed
Deploying to Cloudflare Pages...
✓ Deployment complete!
```

---

## 🆘 Still Having Issues?

1. **Check build logs** in Cloudflare Pages dashboard
2. **Verify wrangler.toml** doesn't have `main = "src/index.js"`
3. **Ensure package.json** has correct scripts
4. **Review** `CLOUDFLARE_PAGES_DEPLOYMENT.md` for detailed guide
5. **Try manual deployment** using `npm run deploy`

---

## 📞 Quick Fix Commands

If you want to deploy right now from your local machine:

```bash
# Navigate to project
cd final_cms

# Build the project
npm run build

# Deploy to Pages (correct command)
npx wrangler pages deploy .next --project-name=dubai-filmmaker-cms

# Or use the npm script
npm run deploy
```

This will deploy directly without going through the Cloudflare Pages build system.
