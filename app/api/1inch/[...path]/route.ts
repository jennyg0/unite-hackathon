import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_BASE = 'https://api.1inch.dev';
const API_KEY = process.env.ONEINCH_API_KEY;

// Simple in-memory rate limiting
const lastRequestTime = new Map<string, number>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Rate limiting: wait at least 1 second between requests per IP
    const clientIP = request.ip || 'unknown';
    const now = Date.now();
    const lastRequest = lastRequestTime.get(clientIP) || 0;
    
    if (now - lastRequest < 1000) {
      const waitTime = 1000 - (now - lastRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastRequestTime.set(clientIP, Date.now());
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
    
    // Copy all search params, handle special cases for 1inch API
    searchParams.forEach((value, key) => {
      if (key === 'chainIds') {
        // 1inch API expects chainIds as repeated params: chainIds=137&chainIds=138
        // This matches axios paramsSerializer: { indexes: null }
        url.searchParams.append('chainIds', value);
      } else {
        url.searchParams.append(key, value);
      }
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

    // Special handling for NFT byaddress endpoint - convert POST to GET with proper params
    if (path === 'nft/v2/byaddress') {
      const url = new URL(`${ONEINCH_API_BASE}/${path}`);
      
      // Add parameters in exact axios format: chainIds=137&address=0x...
      if (body.address) url.searchParams.append('address', body.address);
      if (body.contractAddress) url.searchParams.append('contractAddress', body.contractAddress);
      if (body.chainIds && Array.isArray(body.chainIds)) {
        // For single chainId, just add as chainIds=137 (not chainIds[]=137)
        // This matches axios paramsSerializer: { indexes: null }
        body.chainIds.forEach((chainId: number) => {
          url.searchParams.append('chainIds', chainId.toString());
        });
      }
      
      console.log('Making NFT GET request to:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
        },
      });

      console.log('1inch API NFT response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch API NFT error:', errorText);
        return NextResponse.json(
          { error: `1inch API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('1inch API NFT response data keys:', Object.keys(data));

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
        },
      });
    }
    
    // Default POST handling for other endpoints
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