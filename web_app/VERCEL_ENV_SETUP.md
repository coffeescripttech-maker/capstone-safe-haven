# Vercel Environment Variables Setup

## Critical Issue: Login Redirect Problem

If you're experiencing login redirects back to `/signin?callbackUrl=...`, it's because **NEXTAUTH_URL is not set correctly in Vercel**.

## Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### 1. NextAuth Configuration (CRITICAL)

```
NEXTAUTH_URL=https://your-vercel-app.vercel.app
```

**Important:** Replace `your-vercel-app.vercel.app` with your actual Vercel deployment URL.

Example:
```
NEXTAUTH_URL=https://dubail-film-maker-website-portfolio.vercel.app
```

### 2. NextAuth Secret (CRITICAL)

```
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

**Important:** Generate a secure secret using:
```bash
openssl rand -base64 32
```

Or use any random string generator. This should be a long, random string.

### 3. Cloudflare R2 Storage

```
R2_ENDPOINT=https://4e369248fbb93ecfab45e53137a9980d.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=90de9a24d6683663c992e2ddab5abef7
R2_SECRET_ACCESS_KEY=64dacf30088ce69ad255566e7909ff47194f603fc4e5f75f17f25f5a5f6c71d6
R2_BUCKET_NAME=dubai-filmmaker-assets
R2_PUBLIC_URL=https://pub-e4e29f1338964c2d89ce48344d55d9fe.r2.dev
```

### 4. Cloudflare D1 Database

```
CLOUDFLARE_ACCOUNT_ID=4e369248fbb93ecfab45e53137a9980d
CLOUDFLARE_DATABASE_ID=908f42f0-ad4d-4ce0-b3a2-9bb13cf54795
```

**Note:** Do NOT add `CLOUDFLARE_API_TOKEN` in Vercel - it's not needed for D1 access.

### 5. Supabase (Optional - if using Supabase features)

```
NEXT_PUBLIC_SUPABASE_URL=https://ssoeuogujchfasvofevy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzb2V1b2d1amNoZmFzdm9mZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE4MDAsImV4cCI6MjA3ODY3NzgwMH0.NaGPEA9nMpwLXHEjni6na_mLTQ_6UL2gDZEeAg_C9Hc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzb2V1b2d1amNoZmFzdm9mZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzEwMTgwMCwiZXhwIjoyMDc4Njc3ODAwfQ.e8eMXqx7O3zKvpvWVrkYFGTIcjvKZtOa7We1cFuazZ8
```

### 6. App URL (Optional)

```
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

## Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

2. **Add Each Variable**
   - Click "Add New" button
   - Enter the variable name (e.g., `NEXTAUTH_URL`)
   - Enter the variable value
   - Select environment: Production, Preview, Development (select all)
   - Click "Save"

3. **Redeploy Your Application**
   - After adding all variables, go to "Deployments" tab
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

## Verification

After redeployment, test the login:

1. Go to your Vercel URL: `https://your-app.vercel.app/signin`
2. Enter credentials:
   - Admin: `admin@example.com` / `admin123`
   - User: `user@example.com` / `user123`
3. Click "Sign in"
4. You should be redirected to the dashboard (`/`)

## Debugging

If login still doesn't work:

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for console logs starting with 🔐
   - Check for any error messages

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Click "View Function Logs"
   - Look for authentication errors

3. **Verify Environment Variables**
   - Go to Settings → Environment Variables
   - Make sure `NEXTAUTH_URL` matches your deployment URL exactly
   - Make sure `NEXTAUTH_SECRET` is set

## Common Issues

### Issue: Redirects to `/signin?callbackUrl=...`
**Solution:** `NEXTAUTH_URL` is not set or incorrect. Set it to your exact Vercel URL.

### Issue: "Configuration error" message
**Solution:** `NEXTAUTH_SECRET` is missing. Generate and add a secure secret.

### Issue: "Invalid email or password" (but credentials are correct)
**Solution:** Database connection issue. Verify `CLOUDFLARE_DATABASE_ID` is correct.

### Issue: Session not persisting
**Solution:** Cookie domain mismatch. Make sure `NEXTAUTH_URL` matches the domain you're accessing.

## Security Notes

- Never commit `.env.local` to Git
- Use different secrets for development and production
- Rotate secrets periodically
- Use Vercel's encrypted environment variables feature
- Don't share your `NEXTAUTH_SECRET` or API keys publicly
