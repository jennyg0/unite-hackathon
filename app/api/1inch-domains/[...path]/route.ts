import { NextRequest, NextResponse } from 'next/server';

const ONEINCH_API_KEY = process.env.ONEINCH_API_KEY;
const DOMAINS_BASE_URL = 'https://api.1inch.dev/domains/v2.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!ONEINCH_API_KEY) {
    return NextResponse.json(
      { error: '1inch API key not configured' },
      { status: 500 }
    );
  }

  try {
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    
    // Build the target URL
    let targetUrl = `${DOMAINS_BASE_URL}/${path}`;
    if (searchParams.toString()) {
      targetUrl += `?${searchParams.toString()}`;
    }

    console.log('🔗 Proxying to 1inch Domains API:', targetUrl);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONEINCH_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('1inch Domains API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch from 1inch Domains API',
          status: response.status,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 1inch Domains API response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}