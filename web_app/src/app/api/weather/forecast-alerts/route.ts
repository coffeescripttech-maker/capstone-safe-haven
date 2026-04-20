import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Fetch real forecast-triggered alerts from backend
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use the correct backend URL without /v1
    const backendUrl = 'http://localhost:3001';
    
    console.log('Fetching forecast alerts from:', `${backendUrl}/api/weather/forecast-alerts`);
    
    // Fetch forecast-triggered alerts from backend
    const response = await fetch(`${backendUrl}/api/weather/forecast-alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`Backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Forecast alerts received:', data);
    
    return NextResponse.json({
      status: 'success',
      data: data.data || []
    });
  } catch (error: any) {
    console.error('Error fetching forecast alerts:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to fetch forecast alerts' },
      { status: 500 }
    );
  }
}
