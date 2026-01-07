import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllProjects, createProject } from '@/lib/d1-client';
import { type Project } from '@/lib/db';

// GET /api/projects - Get all projects from remote D1 database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const search = searchParams.get('search');

    // Get all projects from remote D1 database
    let projects = await getAllProjects();

    console.log({projects});

    // Apply filters
    if (category && category !== 'all') {
      projects = projects.filter(p => p.data_cat === category);
    }
    if (featured !== null && featured !== '') {
      projects = projects.filter(p => p.is_featured === (featured === 'true'));
    }
    if (published !== null && published !== '') {
      projects = projects.filter(p => p.is_published === (published === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.client?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      projects,
      total: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/projects - Create new project in remote D1 database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      client,
      category,
      data_cat,
      languages,
      classification,
      vimeo_id,
      video_url,
      poster_image,
      poster_image_srcset,
      credits = [],
      order_index = 0,
      is_featured = false,
      is_published = true
    } = body;

    // Validation
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create project in remote D1 database
    const newProject = await createProject({
      title,
      client,
      category,
      data_cat,
      languages,
      classification,
      vimeo_id,
      video_url,
      poster_image,
      poster_image_srcset,
      credits,
      order_index,
      is_featured,
      is_published
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}