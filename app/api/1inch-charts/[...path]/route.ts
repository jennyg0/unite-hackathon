import { NextRequest, NextResponse } from 'next/server';

const CHARTS_API_BASE_URL = 'https://api.1inch.dev/charts/v1.0';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      );
    }

    // Reconstruct the path
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const fullPath = searchParams ? `${path}?${searchParams}` : path;

    console.log('1inch Charts API request:', {
      path,
      searchParams,
      fullPath,
    });

    // Make request to 1inch Charts API
    const response = await fetch(`${CHARTS_API_BASE_URL}/${fullPath}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch Charts API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { 
          error: `Charts API request failed: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('1inch Charts API response received:', Object.keys(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to proxy 1inch Charts API request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from 1inch Charts API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}