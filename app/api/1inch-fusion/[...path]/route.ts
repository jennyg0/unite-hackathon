import { NextRequest, NextResponse } from 'next/server';

const FUSION_API_BASE_URL = 'https://api.1inch.dev/fusion-plus';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.ONEINCH_API_KEY;
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

    console.log('1inch Fusion+ API request:', {
      path,
      searchParams,
      fullPath,
    });

    // Make request to 1inch Fusion+ API
    const response = await fetch(`${FUSION_API_BASE_URL}/${fullPath}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch Fusion+ API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { 
          error: `Fusion+ API request failed: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('1inch Fusion+ API response received:', Object.keys(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to proxy 1inch Fusion+ API request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from 1inch Fusion+ API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.ONEINCH_API_KEY;
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

    // Get request body
    const body = await request.json();

    console.log('1inch Fusion+ POST API request:', {
      path,
      searchParams,
      fullPath,
      body,
    });

    // Make request to 1inch Fusion+ API
    const response = await fetch(`${FUSION_API_BASE_URL}/${fullPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch Fusion+ POST API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      return NextResponse.json(
        { 
          error: `Fusion+ API request failed: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('1inch Fusion+ POST API response received:', Object.keys(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to proxy 1inch Fusion+ POST API request:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch from 1inch Fusion+ API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}