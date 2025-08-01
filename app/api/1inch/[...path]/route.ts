import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_BASE = 'https://api.1inch.dev';
const API_KEY = process.env.ONEINCH_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('1inch API key not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Reconstruct the path
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    console.log('1inch API Proxy GET:', { path });
    
    // Get the search params from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Build the full URL
    const url = new URL(`${ONEINCH_API_BASE}/${path}`);
    
    // Copy all search params
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    console.log('Making request to:', url.toString());

    // Make the request to 1inch API
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    });

    console.log('1inch API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch API error:', errorText);
      return NextResponse.json(
        { error: `1inch API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Get the response data
    const data = await response.json();
    console.log('1inch API response data keys:', Object.keys(data));

    // Return the response with proper headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('1inch API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from 1inch API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support POST for price requests and swap transactions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      console.error('1inch API key not configured for POST');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();
    
    console.log('1inch API Proxy POST:', { path, body });
    
    const url = new URL(`${ONEINCH_API_BASE}/${path}`);
    
    console.log('Making POST request to:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('1inch API POST response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch API POST error:', errorText);
      return NextResponse.json(
        { error: `1inch API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('1inch API POST response data keys:', Object.keys(data));

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('1inch API proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to post to 1inch API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 