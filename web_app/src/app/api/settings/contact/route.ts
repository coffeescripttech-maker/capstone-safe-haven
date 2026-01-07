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
    let result = await queryD1('SELECT * FROM contact_info WHERE id = 1');
    
    // If no content exists, create default content
    if (!result || !result.results || result.results.length === 0) {
      console.log('[Contact Settings] No content found, creating default...');
      
      // Create table if it doesn't exist
      await queryD1(`
        CREATE TABLE IF NOT EXISTS contact_info (
          id INTEGER PRIMARY KEY DEFAULT 1,
          email TEXT DEFAULT '',
          phone TEXT DEFAULT '',
          city TEXT DEFAULT '',
          street TEXT DEFAULT '',
          vimeo_url TEXT DEFAULT '',
          instagram_url TEXT DEFAULT '',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default content
      await queryD1(
        `INSERT INTO contact_info (id, email, phone, city, street, vimeo_url, instagram_url)
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [
          'contact@example.com',
          '+1 234 567 8900',
          'Your City',
          'Your Street Address',
          'https://vimeo.com/yourprofile',
          'https://instagram.com/yourprofile'
        ]
      );
      
      // Fetch the newly created content
      result = await queryD1('SELECT * FROM contact_info WHERE id = 1');
    }

    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
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
      email,
      phone,
      city,
      street,
      vimeo_url,
      instagram_url,
    } = body;

    await queryD1(
      `UPDATE contact_info SET 
        email = ?,
        phone = ?,
        city = ?,
        street = ?,
        vimeo_url = ?,
        instagram_url = ?
      WHERE id = 1`,
      [
        email || '',
        phone || '',
        city || '',
        street || '',
        vimeo_url || '',
        instagram_url || '',
      ]
    );

    // Fetch updated data
    const result = await queryD1('SELECT * FROM contact_info WHERE id = 1');
    
    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    );
  }
}
