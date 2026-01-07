import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryD1 } from '@/lib/d1-client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get existing content
    let result = await queryD1('SELECT * FROM about_content WHERE id = 1');
    
    // If no content exists, create default content
    if (!result || !result.results || result.results.length === 0) {
      console.log('[About Settings] No content found, creating default...');
      
      // Create table if it doesn't exist
      await queryD1(`
        CREATE TABLE IF NOT EXISTS about_content (
          id INTEGER PRIMARY KEY DEFAULT 1,
          founder_name TEXT DEFAULT '',
          founder_title TEXT DEFAULT '',
          founder_bio TEXT DEFAULT '',
          company_description TEXT DEFAULT '',
          video_button_text TEXT DEFAULT 'Watch Video',
          video_url TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default content
      await queryD1(
        `INSERT INTO about_content (id, founder_name, founder_title, founder_bio, company_description, video_button_text, video_url)
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [
          'Your Name',
          'Founder & Creative Director',
          'Add your bio here...',
          'Add your company description here...',
          'Watch Our Story',
          ''
        ]
      );
      
      // Fetch the newly created content
      result = await queryD1('SELECT * FROM about_content WHERE id = 1');
    }

    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can update settings
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      founder_name,
      founder_title,
      founder_bio,
      company_description,
      video_button_text,
      video_url,
    } = body;

    await queryD1(
      `UPDATE about_content SET 
        founder_name = ?,
        founder_title = ?,
        founder_bio = ?,
        company_description = ?,
        video_button_text = ?,
        video_url = ?
      WHERE id = 1`,
      [
        founder_name || '',
        founder_title || '',
        founder_bio || '',
        company_description || '',
        video_button_text || '',
        video_url || '',
      ]
    );

    // Fetch updated data
    const result = await queryD1('SELECT * FROM about_content WHERE id = 1');
    
    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    );
  }
}
