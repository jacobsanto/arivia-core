
// Netlify function to handle Guesty authentication
exports.handler = async (event, context) => {
  // Set CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }
  
  try {
    // Check if it's a POST request
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    // Get token is the only supported action for now
    if (action === 'get-token') {
      const token = await getGuestyToken();
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      };
    } else {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid action' })
      };
    }
  } catch (error) {
    console.error('Guesty auth function error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};

/**
 * Fetch a new auth token from Guesty API
 */
async function getGuestyToken() {
  const username = process.env.GUESTY_USERNAME;
  const password = process.env.GUESTY_PASSWORD;
  const clientId = process.env.GUESTY_CLIENT_ID;
  const secret = process.env.GUESTY_SECRET;

  if (!username || !password || !clientId || !secret) {
    throw new Error('Missing Guesty credentials');
  }

  const tokenEndpoint = 'https://app.guesty.com/api/v1/auth/token';
  
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', clientId);
    params.append('client_secret', secret);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Guesty auth failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Guesty token:', error);
    throw new Error('Failed to authenticate with Guesty');
  }
}
