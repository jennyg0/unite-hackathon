/**
 * 1inch Domains API Integration
 * 
 * Provides ENS name resolution using the 1inch Domains API.
 * Perfect for showing user-friendly names instead of addresses!
 */

const DOMAINS_BASE_URL = 'https://api.1inch.dev/domains/v2.0';

export interface ENSResolveResult {
  address: string;
  ensName: string | null;
  hasENS: boolean;
}

class OneInchDomains {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, params?: Record<string, string>) {
    // Use proxy in browser to avoid CORS issues
    const isBrowser = typeof window !== 'undefined';
    let url: string;
    
    if (isBrowser) {
      // In browser, use our API proxy
      const searchParams = new URLSearchParams(params);
      url = `/api/1inch-domains${endpoint}?${searchParams.toString()}`;
    } else {
      // On server, use direct 1inch API
      const searchParams = new URLSearchParams(params);
      url = `${DOMAINS_BASE_URL}${endpoint}?${searchParams.toString()}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    
    // Only add Authorization header when not using proxy (server-side)
    if (!isBrowser) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('1inch Domains API error:', errorText);
        throw new Error(`Domains API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('1inch Domains API request failed:', error);
      throw error;
    }
  }

  /**
   * Reverse lookup: get ENS name from wallet address
   * https://api.1inch.dev/domains/v2.0/reverse-lookup?address=0x...
   */
  async reverseLookup(address: string): Promise<ENSResolveResult> {
    try {
      console.log(`🔍 Looking up ENS name for address: ${address}`);
      
      const response = await this.request('/reverse-lookup', { address });
      
      // The API returns the ENS name directly or null if none exists
      const ensName = response?.name || null;
      
      console.log(`✅ ENS lookup result: ${address} -> ${ensName || 'No ENS name'}`);
      
      return {
        address,
        ensName,
        hasENS: !!ensName,
      };
    } catch (error) {
      console.error('Failed to lookup ENS name:', error);
      
      // Return fallback result on error
      return {
        address,
        ensName: null,
        hasENS: false,
      };
    }
  }

  /**
   * Batch reverse lookup for multiple addresses
   */
  async batchReverseLookup(addresses: string[]): Promise<ENSResolveResult[]> {
    console.log(`🔍 Batch ENS lookup for ${addresses.length} addresses`);
    
    const results = [];
    
    for (const address of addresses) {
      try {
        const result = await this.reverseLookup(address);
        results.push(result);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to lookup ENS for ${address}:`, error);
        results.push({
          address,
          ensName: null,
          hasENS: false,
        });
      }
    }
    
    return results;
  }
}

// Singleton instance
let domainsAPI: OneInchDomains | null = null;

export function getOneInchDomains(): OneInchDomains {
  if (!domainsAPI) {
    const apiKey = process.env.ONEINCH_API_KEY;
    if (!apiKey) {
      throw new Error('1inch API key not found. Please set ONEINCH_API_KEY');
    }
    domainsAPI = new OneInchDomains(apiKey);
  }
  return domainsAPI;
}

// Utility functions
export async function resolveENSName(address: string): Promise<string | null> {
  try {
    const domains = getOneInchDomains();
    const result = await domains.reverseLookup(address);
    return result.ensName;
  } catch (error) {
    console.error('Failed to resolve ENS name:', error);
    return null;
  }
}

export async function getDisplayName(address: string): Promise<string> {
  try {
    const ensName = await resolveENSName(address);
    if (ensName) {
      return ensName;
    }
    
    // Fallback to truncated address
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  } catch (error) {
    console.error('Failed to get display name:', error);
    // Ultimate fallback
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Cache for ENS names to avoid repeated lookups
const ensCache = new Map<string, { ensName: string | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedENSName(address: string): Promise<string | null> {
  const cached = ensCache.get(address);
  const now = Date.now();
  
  // Return cached result if it's still fresh
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.ensName;
  }
  
  // Fetch fresh data
  try {
    const ensName = await resolveENSName(address);
    ensCache.set(address, { ensName, timestamp: now });
    return ensName;
  } catch (error) {
    console.error('Failed to get cached ENS name:', error);
    return null;
  }
}

export function formatAddressWithENS(address: string, ensName?: string | null): string {
  if (ensName) {
    return ensName;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}