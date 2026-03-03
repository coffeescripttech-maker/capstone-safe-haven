import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Build query parameters
    const url = new URL(`${BACKEND_URL}/admin/audit-logs`);
    
    // Add all query parameters
    const params = [
      'userId', 'role', 'action', 'status', 
      'startDate', 'endDate', 'limit', 'offset'
    ];
    
    params.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        url.searchParams.set(param, value);
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': token
      }
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
