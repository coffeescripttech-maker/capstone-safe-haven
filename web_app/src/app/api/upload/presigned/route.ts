import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  generatePresignedUploadUrl,
  validateFileType,
  IMAGE_TYPES,
  VIDEO_TYPES
} from '@/lib/r2-storage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName, contentType, folder, type } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ 
        error: 'fileName and contentType are required' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = type === 'image' ? IMAGE_TYPES : VIDEO_TYPES;
    if (!validateFileType(fileName, allowedTypes)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const baseName = fileName.split('.').slice(0, -1).join('.');
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    const key = folder 
      ? `${folder}/${sanitizedName}-${timestamp}-${randomString}.${extension}`
      : `${sanitizedName}-${timestamp}-${randomString}.${extension}`;

    // Generate presigned URL
    const presignedUrl = await generatePresignedUploadUrl(key, contentType);

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`
    });

  } catch (error) {
    console.error('Presigned URL error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate presigned URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}