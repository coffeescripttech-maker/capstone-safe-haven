# 🗄️ Cloudflare R2 Storage Setup Guide

## Overview

This guide will help you set up Cloudflare R2 Object Storage for handling image and video uploads in your Dubai Filmmaker CMS.

## 🚀 Quick Setup

### 1. Create R2 Bucket

```bash
# Run the automated setup
npm run r2:setup
```

### 2. Get R2 Credentials

1. **Go to Cloudflare Dashboard** → **R2 Object Storage**
2. **Click "Manage R2 API tokens"**
3. **Create API Token** with permissions:
   - `Object Storage:Edit` for your bucket
4. **Copy the credentials**:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

### 3. Configure Environment Variables

Update your `.env.local` file:

```env
# Cloudflare R2 Storage Configuration
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=dubai-filmmaker-assets
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
```

### 4. Set Up Custom Domain (Optional but Recommended)

1. **Go to R2 Dashboard** → **Your Bucket** → **Settings**
2. **Connect Custom Domain**:
   - Domain: `assets.dubaifilmmaker.ae`
   - Enable public access
3. **Update DNS** in Cloudflare:
   - Add CNAME record: `assets` → `your-bucket.r2.dev`

## 📁 File Organization

The system automatically organizes files:

```
dubai-filmmaker-assets/
├── images/
│   ├── projects/
│   │   └── posters/
│   ├── profiles/
│   └── general/
├── videos/
│   ├── projects/
│   ├── reels/
│   └── demos/
└── documents/
    └── contracts/
```

## 🔧 Features

### Image Upload
- **Supported formats**: JPG, PNG, GIF, WebP
- **Max size**: 10MB
- **Auto-optimization**: Responsive srcsets
- **Folder organization**: Automatic categorization

### Video Upload
- **Supported formats**: MP4, WebM, AVI, MOV
- **Max size**: 100MB
- **Direct upload**: Presigned URLs for large files
- **Streaming ready**: Optimized for web playback

### Security Features
- **Authentication required**: All uploads require login
- **File validation**: Type and size checking
- **Secure URLs**: Presigned URLs for direct uploads
- **CORS configured**: Proper cross-origin settings

## 📊 Usage Examples

### Basic Image Upload

```typescript
import FileUpload from '@/components/upload/FileUpload';

<FileUpload
  type="image"
  folder="projects/posters"
  onUploadComplete={(result) => {
    console.log('Uploaded:', result.publicUrl);
  }}
  onUploadError={(error) => {
    console.error('Upload failed:', error);
  }}
/>
```

### Video Upload

```typescript
<FileUpload
  type="video"
  folder="projects/demos"
  maxSizeMB={50}
  onUploadComplete={(result) => {
    setVideoUrl(result.publicUrl);
  }}
/>
```

### Programmatic Upload

```typescript
import { uploadImage } from '@/lib/r2-storage';

const handleUpload = async (file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadImage(buffer, file.name, {
    folder: 'projects/posters'
  });
  
  console.log('Uploaded to:', result.publicUrl);
};
```

## 🛠️ Management Commands

```bash
# List all files in bucket
npm run r2:list

# Get bucket information
npm run r2:info

# Manual bucket operations
wrangler r2 object list dubai-filmmaker-assets
wrangler r2 object get dubai-filmmaker-assets/path/to/file.jpg
wrangler r2 object delete dubai-filmmaker-assets/path/to/file.jpg
```

## 🔐 Security Best Practices

### 1. Access Control
- Use separate API tokens for different environments
- Limit token permissions to specific buckets
- Rotate tokens regularly

### 2. File Validation
- Always validate file types on server-side
- Implement size limits
- Scan for malicious content

### 3. URL Security
- Use presigned URLs for sensitive content
- Set appropriate expiration times
- Monitor access patterns

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=prod-access-key
R2_SECRET_ACCESS_KEY=prod-secret-key
R2_BUCKET_NAME=dubai-filmmaker-assets-prod
R2_PUBLIC_URL=https://assets.dubaifilmmaker.ae
```

### 2. Wrangler Configuration

Update `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "dubai-filmmaker-assets-prod"
preview_bucket_name = "dubai-filmmaker-assets-dev"
```

### 3. Deploy

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy

# Or deploy to Vercel with R2 integration
vercel --prod
```

## 📈 Monitoring & Analytics

### 1. Usage Tracking
- Monitor storage usage in R2 dashboard
- Track bandwidth consumption
- Set up billing alerts

### 2. Performance Monitoring
- Use Cloudflare Analytics
- Monitor upload success rates
- Track file access patterns

### 3. Error Handling
- Implement retry logic for failed uploads
- Log upload errors for debugging
- Set up error notifications

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Re-apply CORS configuration
   npm run r2:setup
   ```

2. **Authentication Errors**
   - Verify API token permissions
   - Check endpoint URL format
   - Ensure token hasn't expired

3. **Upload Failures**
   - Check file size limits
   - Verify file type restrictions
   - Monitor network connectivity

### Debug Commands

```bash
# Test R2 connection
wrangler r2 bucket list

# Check bucket CORS
wrangler r2 bucket cors get dubai-filmmaker-assets

# View recent uploads
wrangler r2 object list dubai-filmmaker-assets --limit 10
```

## 💰 Cost Optimization

### 1. Storage Classes
- Use standard storage for frequently accessed files
- Consider infrequent access for archived content

### 2. Lifecycle Policies
- Set up automatic deletion for temporary files
- Archive old project files

### 3. Bandwidth Optimization
- Use Cloudflare CDN for global distribution
- Implement image optimization
- Enable compression

## 🎯 Next Steps

1. **Image Optimization**: Add automatic image resizing
2. **Video Processing**: Implement video transcoding
3. **Backup Strategy**: Set up cross-region replication
4. **CDN Integration**: Optimize global delivery
5. **Analytics**: Track usage and performance metrics

---

Your R2 storage is now ready for production use! 🎉