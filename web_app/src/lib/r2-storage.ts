import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Proxy configuration - always use proxy for R2
const HTTPS_PROXY = process.env.HTTPS_PROXY || process.env.https_proxy;

const proxyAgent = HTTPS_PROXY ? new HttpsProxyAgent(HTTPS_PROXY, {
  rejectUnauthorized: false,
  keepAlive: true,
  keepAliveMsecs: 1000,
}) : undefined;

console.log('[R2 Client] Using proxy:', HTTPS_PROXY || 'None');

// Configure R2 Client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
  requestHandler: proxyAgent ? new NodeHttpHandler({
    httpsAgent: proxyAgent,
    requestTimeout: 120000, // Increase to 2 minutes
    connectionTimeout: 60000, // Increase to 1 minute
  }) : undefined,
  maxAttempts: 5, // Increase to 5 attempts for images
  retryMode: 'adaptive', // Use adaptive retry mode
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!; // Your R2 custom domain or public URL

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
  size: number;
  contentType: string;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

// Generate a unique file key
function generateFileKey(originalName: string, folder?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
  
  const fileName = `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
  return folder ? `${folder}/${fileName}` : fileName;
}

// Upload file to R2
export async function uploadFile(
  file: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const key = options.fileName || generateFileKey(originalName, options.folder);
    const contentType = options.contentType || getContentType(originalName);

    console.log('[R2 Upload] Starting upload:', {
      key,
      contentType,
      size: file.length,
      folder: options.folder,
      originalName
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: options.metadata,
    });

    console.log('[R2 Upload] Sending to bucket:', BUCKET_NAME);
    console.log('[R2 Upload] Using proxy:', HTTPS_PROXY || 'None');

    await r2Client.send(command);

    const publicUrl = `${PUBLIC_URL}/${key}`;

    console.log('[R2 Upload] Success! Public URL:', publicUrl);

    return {
      key,
      url: publicUrl,
      publicUrl,
      size: file.length,
      contentType,
    };
  } catch (error) {
    console.error('[R2 Upload] ERROR Details:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown',
      errorStack: error instanceof Error ? error.stack : 'No stack',
      errorCode: (error as any)?.code,
      errorMetadata: (error as any)?.$metadata,
    });
    throw new Error('Failed to upload file to R2');
  }
}

// Upload image with automatic optimization
export async function uploadImage(
  file: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const imageOptions = {
    ...options,
    folder: options.folder || 'images',
    contentType: options.contentType || getContentType(originalName),
  };

  return uploadFile(file, originalName, imageOptions);
}

// Upload video
export async function uploadVideo(
  file: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const videoOptions = {
    ...options,
    folder: options.folder || 'videos',
    contentType: options.contentType || getContentType(originalName),
  };

  return uploadFile(file, originalName, videoOptions);
}

// Delete file from R2
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('R2 delete error:', error);
    throw new Error('Failed to delete file from R2');
  }
}

// Generate presigned URL for direct uploads (client-side)
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('R2 presigned URL error:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

// Generate presigned URL for downloads
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('R2 presigned download URL error:', error);
    throw new Error('Failed to generate presigned download URL');
  }
}

// Get content type from file extension
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  return mimeTypes[extension || ''] || 'application/octet-stream';
}

// Generate responsive image URLs (for different sizes)
export function generateResponsiveImageUrls(
  baseUrl: string,
  sizes: number[] = [300, 600, 900, 1200]
): Record<string, string> {
  // Since R2 doesn't have built-in image transformation,
  // you might want to use Cloudflare Images or implement your own resizing
  // For now, we'll return the same URL for all sizes
  const urls: Record<string, string> = {};
  
  sizes.forEach(size => {
    urls[`${size}w`] = baseUrl;
  });
  
  return urls;
}

// Validate file type
export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(extension || '');
}

// Validate file size
export function validateFileSize(fileSize: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

// Image validation
export const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
export const VIDEO_TYPES = ['mp4', 'webm', 'avi', 'mov'];
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 500; // Increased to 500MB for larger video files