
const axios = require('axios');

// Guesty API base URL
const GUESTY_API_BASE_URL = 'https://open-api.guesty.com/v1';

// Cache for the auth token
let authTokenCache = {
  token: null,
  expiresAt: null
};

/**
 * Get an authentication token from Guesty API
 */
const getAuthToken = async () => {
  // Check if we have a valid cached token
  if (authTokenCache.token && authTokenCache.expiresAt && authTokenCache.expiresAt > Date.now()) {
    console.log('Using cached auth token');
    return authTokenCache.token;
  }
  
  console.log('Requesting new auth token from Guesty');
  
  try {
    // Get credentials from environment variables
    const clientId = process.env.GUESTY_CLIENT_ID;
    const clientSecret = process.env.GUESTY_SECRET;
    const username = process.env.GUESTY_USERNAME;
    const password = process.env.GUESTY_PASSWORD;
    
    if (!clientId || !clientSecret || !username || !password) {
      throw new Error('Missing Guesty API credentials. Please configure environment variables in Netlify dashboard.');
    }
    
    // Request a new token from Guesty
    const response = await axios.post('https://app.guesty.com/api/v1/auth/token', 
      `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    if (!response.data || !response.data.access_token) {
      throw new Error('Failed to obtain access token from Guesty API');
    }
    
    // Cache the token with expiration
    const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided
    authTokenCache = {
      token: response.data.access_token,
      expiresAt: Date.now() + (expiresIn * 1000) - 60000 // Subtract 1 minute for safety
    };
    
    return authTokenCache.token;
  } catch (error) {
    console.error('Error obtaining Guesty auth token:', error);
    throw new Error(`Failed to authenticate with Guesty: ${error.message}`);
  }
};

/**
 * Main serverless function handler
 */
exports.handler = async function(event, context) {
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
  
  // Only allow GET, POST, PUT, DELETE methods
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }
  
  try {
    // Extract the endpoint from query parameters
    const { endpoint } = event.queryStringParameters || {};
    
    if (!endpoint) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Missing endpoint parameter' })
      };
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Parse the request body if present
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (err) {
        console.error('Failed to parse request body:', err);
      }
    }
    
    // Extract method and data from the request body or use the HTTP method
    const method = requestBody.method || event.httpMethod;
    const data = requestBody.data || undefined;
    
    // Build the full URL
    const url = `${GUESTY_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Extract any params_ prefixed query parameters
    const params = {};
    if (event.queryStringParameters) {
      Object.keys(event.queryStringParameters).forEach(key => {
        if (key.startsWith('param_')) {
          const paramName = key.substring(6); // Remove 'param_' prefix
          params[paramName] = event.queryStringParameters[key];
        }
      });
    }
    
    // Add query parameters to URL if needed
    let finalUrl = url;
    if (Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
    
    // Set up request config
    const config = {
      method: method,
      url: finalUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Add request body for POST or PUT
    if (['POST', 'PUT'].includes(method) && data) {
      config.data = data;
    }
    
    console.log(`Making ${config.method} request to ${finalUrl}`);
    
    // Make the request to Guesty API
    const response = await axios(config);
    
    // Return the response to the client
    return {
      statusCode: response.status || 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(response.data)
    };
    
  } catch (error) {
    console.error('Error in Guesty API function:', error);
    
    // Try to extract status code from axios error
    const statusCode = error.response?.status || 500;
    
    // Try to extract error details from axios error
    const errorDetails = error.response?.data || { message: error.message };
    
    return {
      statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Guesty API request failed',
        details: errorDetails
      })
    };
  }
};
