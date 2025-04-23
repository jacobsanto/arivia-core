
import { extractRateLimitInfo } from '../utils.ts';

export async function fetchBookingsFromGuesty(token: string, listingId: string): Promise<any> {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://open-api.guesty.com/v1/reservations?listingId=${listingId}&endDate[gte]=${today}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const status = response.status;
    
    if (status === 429) {
      throw new Error(`Rate limit exceeded: ${errorText}`);
    }
    
    throw new Error(`Failed to fetch bookings: ${status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const rateLimitInfo = extractRateLimitInfo(response.headers);

  return { data, rateLimitInfo };
}
