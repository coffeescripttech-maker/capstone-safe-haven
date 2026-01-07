# Direct R2 Upload Fix - Vercel Payload Limit Solution

## Problem
Vercel serverless functions have a 4.5MB payload limit, causing `FUNCTION_PAYLOAD_TOO_LARGE` errors when uploading videos.

## Solution Implemented
Direct browser-to-R2 uploads using presigned URLs, completely bypassing Vercel's payload limits.

## How It Works

### 1. Request Presigned URL
- Browser requests a presigned URL from `/api/upload/presigned-url`
- API generates a temporary upload URL (valid for 1 hour)
- Returns: presigned URL, file key, and public URL

### 2. Direct Upload
- Browser uploads file directly to R2 using the presigned URL
- Upload progress is tracked in real-time
- No data passes through Vercel functions

### 3. Complete
- File is immediately available at the public URL
- No size limits (can upload GB-sized videos)

## Files Modified

1. **vercel.json** - Added function timeout configurations
2. **src/app/api/upload/presigned-url/route.ts** - New API endpoint for generating presigned URLs
3. **src/components/upload/FileUpload.tsx** - Updated to use direct upload flow

## Benefits

✅ No file size limits (upload videos of any size)
✅ Faster uploads (direct to R2, no proxy)
✅ Better progress tracking
✅ Works on Vercel free tier
✅ More reliable for large files

## Testing

1. Deploy to Vercel: `npm run build && vercel --prod`
2. Try uploading a large video (>5MB)
3. Upload should complete successfully with progress tracking

## Environment Variables Required

Make sure these are set in Vercel:
- `R2_ENDPOINT` - Your R2 endpoint URL
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - Your bucket name
- `R2_PUBLIC_URL` - Public URL for accessing files

## Deploy Now

```bash
cd final_cms
npm run build
vercel --prod
```

Your video uploads will now work without size limits!
