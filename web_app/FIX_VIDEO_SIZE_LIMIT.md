# Fix Video Upload Size Limit

## Issue
User encountered error: "File too large. Maximum size: 100MB" when trying to upload video files.

## Root Cause
The `MAX_VIDEO_SIZE_MB` constant in `src/lib/r2-storage.ts` was set to 100MB, which is too restrictive for professional video files.

## Solution
Increased the maximum video file size limit from 100MB to 500MB.

## Changes Made

### File: `src/lib/r2-storage.ts`
```typescript
// Before
export const MAX_VIDEO_SIZE_MB = 100;

// After
export const MAX_VIDEO_SIZE_MB = 500; // Increased to 500MB for larger video files
```

## Impact
- Users can now upload video files up to 500MB
- The UI already shows "Max size: 500MB" in the help text
- No other changes needed

## Notes
- If you need to support even larger files (1GB+), you can increase this limit further
- Keep in mind R2 storage costs and upload times for very large files
- Consider implementing chunked uploads for files larger than 500MB for better reliability

## Testing
1. Try uploading a video file between 100MB and 500MB
2. Verify the upload completes successfully
3. Check that the progress indicator works correctly
4. Confirm the video plays after upload
