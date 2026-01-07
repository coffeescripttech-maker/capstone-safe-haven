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

    const result = await queryD1('SELECT * FROM header_config WHERE id = 1');
    
    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json({ error: 'Header config not found' }, { status: 404 });
    }

    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error fetching header config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch header config' },
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
    const { active_preset, config_json, logo_default, logo_reversed, logo_stacked } = body;
    
    console.log('📝 Updating header config with:', { active_preset, config_json, logo_default, logo_reversed, logo_stacked });

    // Validate JSON if provided
    if (config_json) {
      try {
        JSON.parse(config_json);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid JSON format in config_json' },
          { status: 400 }
        );
      }
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (active_preset !== undefined) {
      updates.push('active_preset = ?');
      values.push(active_preset || 'default');
    }
    if (config_json !== undefined) {
      updates.push('config_json = ?');
      values.push(config_json || '{}');
    }
    if (logo_default !== undefined) {
      updates.push('logo_default = ?');
      values.push(logo_default);
    }
    if (logo_reversed !== undefined) {
      updates.push('logo_reversed = ?');
      values.push(logo_reversed);
    }
    if (logo_stacked !== undefined) {
      updates.push('logo_stacked = ?');
      values.push(logo_stacked);
    }

    if (updates.length > 0) {
      const query = `UPDATE header_config SET ${updates.join(', ')} WHERE id = 1`;
      console.log('🔄 Executing query:', query, 'with values:', values);
      
      await queryD1(query, values);
      console.log('✅ Database updated successfully');
    }

    // Fetch updated data
    const result = await queryD1('SELECT * FROM header_config WHERE id = 1');
    console.log('📊 Updated header config:', result.results[0]);
    
    return NextResponse.json(result.results[0]);
  } catch (error) {
    console.error('Error updating header config:', error);
    return NextResponse.json(
      { error: 'Failed to update header config' },
      { status: 500 }
    );
  }
}
