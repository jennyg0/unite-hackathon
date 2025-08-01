/**
 * 1inch Web3 RPC Proxy
 * Handles CORS issues for 1inch RPC endpoints used by viem clients
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> }
) {
  const apiKey = process.env.ONEINCH_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: '1inch API key not configured' },
      { status: 500 }
    );
  }

  try {
    const resolvedParams = await params;
    const chainId = resolvedParams.chainId;
    const body = await request.json();

    console.log('🔗 1inch RPC proxy request:', {
      chainId,
      method: body.method,
      paramsLength: body.params?.length
    });

    const response = await fetch(`https://api.1inch.dev/web3/${chainId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 1inch RPC error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: `1inch RPC error: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 1inch RPC response received');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 1inch RPC proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy 1inch RPC request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}