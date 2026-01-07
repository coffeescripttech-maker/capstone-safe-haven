import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1-client';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Public API endpoint - no authentication required
// This endpoint is specifically for the portfolio website to fetch about content
export async function GET() {
  try {
    const result = await queryD1('SELECT * FROM about_content WHERE id = 1');
    
    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json(
        { error: 'About content not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const aboutContent = result.results[0];

    // Transform to match portfolio website's expected structure
    const transformedData = {
      page: {
        title: 'About',
        description: 'Award-winning filmmaker and international film production house based in Dubai.',
        founder: {
          name: aboutContent.founder_name || '',
          title: aboutContent.founder_title || '',
          bio: aboutContent.founder_bio || ''
        },
        content: {
          main_text: aboutContent.company_description || '',
          video_button: {
            text: aboutContent.video_button_text || '',
            video_url: aboutContent.video_url || ''
          }
        }
      }
    };

    return NextResponse.json(
      transformedData,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching public about content:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch about content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
