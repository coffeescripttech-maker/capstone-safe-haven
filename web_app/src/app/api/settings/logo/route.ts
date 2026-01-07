import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { queryD1 } from '@/lib/d1-client';

export async function GET(request: NextRequest) {
  try {
    // Logo settings are public - no authentication required
    // This allows logos to be displayed on signin page and other public pages
    
    const result = await queryD1('SELECT * FROM logo_settings WHERE id = 1');
    
    if (!result || !result.results || result.results.length === 0) {
      // Return default values if not found
      return NextResponse.json({
        id: 1,
        logo_light: '/images/logo/logo.svg',
        logo_dark: '/images/logo/logo-dark.svg',
        logo_icon: '/images/logo/logo-icon.svg',
      });
    }

    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error fetching logo settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo settings' },
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
    const { logo_light, logo_dark, logo_icon } = body;

    console.log('Updating logo settings:', { logo_light, logo_dark, logo_icon });

    // Ensure table exists
    await queryD1(`
      CREATE TABLE IF NOT EXISTS logo_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        logo_light TEXT,
        logo_dark TEXT,
        logo_icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if row exists
    const existing = await queryD1('SELECT * FROM logo_settings WHERE id = 1');
    
    if (!existing || !existing.results || existing.results.length === 0) {
      // Insert new row
      await queryD1(
        `INSERT INTO logo_settings (id, logo_light, logo_dark, logo_icon)
         VALUES (1, ?, ?, ?)`,
        [logo_light || '', logo_dark || '', logo_icon || '']
      );
    } else {
      // Update existing row
      await queryD1(
        `UPDATE logo_settings SET 
          logo_light = ?,
          logo_dark = ?,
          logo_icon = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [logo_light || '', logo_dark || '', logo_icon || '']
      );
    }

    // Fetch updated data and return clean object
    const result = await queryD1('SELECT logo_light, logo_dark, logo_icon FROM logo_settings WHERE id = 1');
    
    const responseData = {
      id: 1,
      logo_light: result.results[0].logo_light,
      logo_dark: result.results[0].logo_dark,
      logo_icon: result.results[0].logo_icon,
    };
    
    console.log('Logo settings updated successfully:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating logo settings:', error);
    return NextResponse.json(
      { error: 'Failed to update logo settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
