import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_BASE = 'https://api.1inch.dev';
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the path
    const path = params.path.join('/');
    
    // Get the search params from the request
    const searchParams = request.nextUrl.searchParams;
    
    // Build the full URL
    const url = new URL(`${ONEINCH_API_BASE}/${path}`);
    
    // Copy all search params
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Make the request to 1inch API
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    });

    // Get the response data
    const data = await response.json();

    // Return the response with proper headers
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // Add cache headers if needed
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('1inch API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from 1inch API' },
      { status: 500 }
    );
  }
}

// Also support POST for swap transactions
export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const body = await request.json();
    
    const url = new URL(`${ONEINCH_API_BASE}/${path}`);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('1inch API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to post to 1inch API' },
      { status: 500 }
    );
  }
} 