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
// This endpoint is specifically for the portfolio website to fetch contact info
export async function GET() {
  try {
    const result = await queryD1('SELECT * FROM contact_info WHERE id = 1');
    
    if (!result || !result.results || result.results.length === 0) {
      return NextResponse.json(
        { error: 'Contact info not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const contactInfo = result.results[0];

    // Transform to match portfolio website's expected structure
    const transformedData = {
      page: {
        title: 'Contact',
        description: 'Get in touch with our team',
        staff: [], // Empty array for now, can be populated later if needed
        address: {
          street: contactInfo.street || '',
          city: contactInfo.city || 'Dubai, UAE',
          phone: contactInfo.phone || '',
          email: contactInfo.email || ''
        },
        social: {
          vimeo: contactInfo.vimeo_url || '',
          instagram: contactInfo.instagram_url || ''
        }
      }
    };

    return NextResponse.json(
      transformedData,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching public contact info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch contact info',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
