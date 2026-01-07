import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  uploadImage, 
  uploadVideo, 
  validateFileType, 
  validateFileSize,
  IMAGE_TYPES,
  VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB
} from '@/lib/r2-storage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'video'
    const folder = formData.get('folder') as string || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const isImage = type === 'image';
    const allowedTypes = isImage ? IMAGE_TYPES : VIDEO_TYPES;
    const maxSize = isImage ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;

    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    if (!validateFileSize(file.size, maxSize)) {
      return NextResponse.json({ 
        error: `File too large. Maximum size: ${maxSize}MB` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to R2
    const result = isImage 
      ? await uploadImage(buffer, file.name, { folder })
      : await uploadVideo(buffer, file.name, { folder });

    return NextResponse.json({
      success: true,
      file: {
        key: result.key,
        url: result.url,
        publicUrl: result.publicUrl,
        size: result.size,
        contentType: result.contentType,
        originalName: file.name,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}