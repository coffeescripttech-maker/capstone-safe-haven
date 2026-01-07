# Fix Cloudflare API Token Permissions

## ❌ Current Error
```
Authentication error [code: 10000]
You are missing the `User->User Details->Read` permission
You are missing the `User->Memberships->Read` permission
```

## 🔍 Problem
Your Cloudflare API token (set in `CLOUDFLARE_API_TOKEN` environment variable) doesn't have sufficient permissions to deploy to Cloudflare Pages.

---

## ✅ Solution 1: Use OAuth Login (Recommended)

Instead of using an API token, login with OAuth which gives full permissions:

### Step 1: Clear the API Token
```bash
# Windows PowerShell
$env:CLOUDFLARE_API_TOKEN = ""

# Windows CMD
set CLOUDFLARE_API_TOKEN=

# Linux/Mac
unset CLOUDFLARE_API_TOKEN
```

### Step 2: Login with OAuth
```bash
wrangler login
```

This will open your browser and authenticate with full permissions.

### Step 3: Deploy
```bash
npm run deploy
```

---

## ✅ Solution 2: Create New API Token with Correct Permissions

If you prefer using an API token:

### Step 1: Go to Cloudflare Dashboard
1. Navigate to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**

### Step 2: Use Custom Token Template
1. Click **Create Custom Token**
2. Give it a name: `Pages Deployment Token`

### Step 3: Add Required Permissions

**Account Permissions:**
- ✅ `Cloudflare Pages` → `Edit`
- ✅ `Account Settings` → `Read`
- ✅ `D1` → `Edit` (for database access)
- ✅ `Workers R2 Storage` → `Edit` (for R2 access)

**User Permissions:**
- ✅ `User Details` → `Read`
- ✅ `Memberships` → `Read`

### Step 4: Set Account Resources
- **Account Resources:** Include → Select your account

### Step 5: Create Token
1. Click **Continue to summary**
2. Click **Create Token**
3. **Copy the token** (you won't see it again!)

### Step 6: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN = "your-token-here"
```

**Windows CMD:**
```cmd
set CLOUDFLARE_API_TOKEN=your-token-here
```

**Linux/Mac:**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

**Permanent (add to your shell profile):**
```bash
# Windows: Add to PowerShell profile
# Linux/Mac: Add to ~/.bashrc or ~/.zshrc
export CLOUDFLARE_API_TOKEN="your-token-here"
```

### Step 7: Deploy
```bash
npm run deploy
```

---

## ✅ Solution 3: Deploy via Cloudflare Dashboard (No Token Needed)

The easiest way - let Cloudflare handle everything:

### Step 1: Push to Git
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect Repository to Cloudflare Pages
1. Go to https://dash.cloudflare.com
2. Workers & Pages → Create application → Pages
3. Connect to Git → Select your repository
4. Configure build settings:
   - Framework: `Next.js`
   - Build command: `npm run build`
   - Build output: `.next`
   - Root directory: `final_cms`

### Step 3: Add Environment Variables
In Pages Settings → Environment variables:
```
NEXTAUTH_URL=https://your-domain.pages.dev
NEXTAUTH_SECRET=your-secret-here
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
ENVIRONMENT=production
```

### Step 4: Add Bindings
In Pages Settings → Functions → Bindings:
- D1: `DB` → `dubai-filmmaker-cms`
- R2: `dubailfilmmaker` → `dubailfilmmaker`

### Step 5: Deploy
Click **Save and Deploy**

Now every push to your main branch automatically deploys!

---

## 🎯 Recommended Approach

**For Development/Testing:**
- Use `wrangler login` (OAuth) - easiest and most reliable

**For CI/CD Pipelines:**
- Create API token with full permissions
- Store in GitHub Secrets or environment variables

**For Production:**
- Connect Git repository to Cloudflare Pages
- Automatic deployments on every push
- No manual deployment needed

---

## 🔧 Quick Fix Right Now

**Fastest solution:**

```bash
# Clear any existing token
$env:CLOUDFLARE_API_TOKEN = ""

# Login with OAuth
wrangler login

# Deploy
npm run deploy
```

This will open your browser, authenticate, and give you full permissions.

---

## 📋 Token Permissions Checklist

If creating a custom API token, ensure it has:

**Account Permissions:**
- [x] Cloudflare Pages → Edit
- [x] Account Settings → Read
- [x] D1 → Edit
- [x] Workers R2 Storage → Edit

**User Permissions:**
- [x] User Details → Read
- [x] Memberships → Read

**Account Resources:**
- [x] Include → Your specific account

**IP Address Filtering:**
- [x] All IP addresses (or specify your IPs)

**TTL:**
- [x] Set expiration date (optional)

---

## 🚨 Common Issues

### Issue 1: Token still doesn't work after creating
**Solution:** Make sure you copied the FULL token and set it correctly in environment variable

### Issue 2: "Authentication error" persists
**Solution:** Use `wrangler login` instead of API token

### Issue 3: Token works but deployment fails
**Solution:** Check that D1 and R2 bindings are configured in Pages dashboard

### Issue 4: Can't find API tokens page
**Solution:** Go directly to https://dash.cloudflare.com/profile/api-tokens

---

## ✅ Verify Your Setup

After fixing authentication, test with:

```bash
# Check authentication
wrangler whoami

# Should show your email and account
# If it shows "Unable to retrieve email", you're using a token with insufficient permissions

# Deploy
npm run deploy
```

---

## 📚 Resources

- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Wrangler Authentication](https://developers.cloudflare.com/workers/wrangler/commands/#login)
- [Pages Deployment](https://developers.cloudflare.com/pages/get-started/)

---

## 🎯 Summary

**Problem:** API token lacks permissions

**Quick Fix:**
```bash
$env:CLOUDFLARE_API_TOKEN = ""
wrangler login
npm run deploy
```

**Permanent Fix:** Connect Git repo to Cloudflare Pages for automatic deployments
