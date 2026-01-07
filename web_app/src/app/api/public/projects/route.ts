import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/d1-client';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins (or specify 'http://localhost:3001')
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Public API endpoint - no authentication required
// This endpoint is specifically for the portfolio website to fetch projects
export async function GET(request: NextRequest) {
  try {
    // Get all projects from remote D1 database
    let projects = await getAllProjects();
    
    // Only return published projects for public API
    projects = projects.filter(p => p.is_published === true);
    
    // Transform data to match portfolio website format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      client: project.client,
      category: project.category,
      data_cat: project.data_cat,
      languages: project.languages,
      classification: project.classification,
      vimeo_id: project.vimeo_id || '',
      video_url: project.video_url,
      poster_image: project.poster_image || '',
      poster_image_srcset: project.poster_image_srcset || '',
      link: `works/project-detail#id=${project.id}`,
      credits: project.credits || [],
      order_index: project.order_index,
      is_featured: project.is_featured,
      is_published: project.is_published
    }));
    
    // Sort by order_index
    transformedProjects.sort((a, b) => a.order_index - b.order_index);

    return NextResponse.json(
      {
        projects: transformedProjects,
        total: transformedProjects.length
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
