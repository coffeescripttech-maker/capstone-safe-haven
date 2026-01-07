# R2 CORS Setup Guide - Fix Upload CORS Error

## The Problem
You're getting: `Access to XMLHttpRequest has been blocked by CORS policy`

This happens because your R2 bucket doesn't allow direct uploads from your website.

## Quick Fix - Set CORS via Cloudflare Dashboard

### Step 1: Go to R2 Bucket Settings
1. Open: https://dash.cloudflare.com/4e369248fbb93ecfab45e53137a9980d/r2/default/buckets/dubai-filmmaker-assets
2. Click on your bucket: **dubai-filmmaker-assets**
3. Click the **Settings** tab

### Step 2: Configure CORS
1. Scroll down to **CORS Policy**
2. Click **Edit CORS Policy**
3. Paste this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://dubail-film-maker-website-portfolio.vercel.app",
      "https://*.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

4. Click **Save**

### Step 3: Test Upload
1. Go back to your CMS: http://localhost:3000
2. Try uploading a video again
3. It should work now! ✅

## Alternative: Update API Token Permissions

If you want to use the command line, update your API token:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find your token: **NXu3f4s9376pvFJFSUhE8AZ2UtcyFpcEYVZG2NmF**
3. Click **Edit**
4. Add these permissions:
   - **R2: Edit** (for CORS configuration)
   - **User: Read** (for user details)
5. Save and try the command again:

```bash
cd final_cms
wrangler r2 bucket cors set dubai-filmmaker-assets --file r2-cors-config.json
```

## What This Does

- Allows your website (localhost and Vercel) to upload files directly to R2
- Bypasses Vercel's 4.5MB limit completely
- Enables progress tracking for large video uploads
- Makes uploads faster (direct to R2, no proxy)

## After CORS is Set

Your uploads will work like this:
1. Browser requests upload URL from your API
2. Browser uploads directly to R2 (with progress)
3. File is immediately available at public URL

No more payload size errors! 🎉
