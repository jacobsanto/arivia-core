
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
    const clientSecret = process.env.GUESTY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Missing Guesty API credentials. Please configure GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET environment variables.');
    }
    
    // Request a new token from Guesty
    const response = await axios.post('https://app.guesty.com/api/v1/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'open-api'
    });
    
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
  // Only allow GET, POST, PUT methods
  if (!['GET', 'POST', 'PUT'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }
  
  try {
    // Extract the endpoint from query parameters
    const { endpoint } = event.queryStringParameters || {};
    
    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing endpoint parameter' })
      };
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Build the full URL
    const url = `${GUESTY_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Set up request config
    const config = {
      method: event.httpMethod,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Add request body for POST or PUT
    if (['POST', 'PUT'].includes(event.httpMethod) && event.body) {
      config.data = JSON.parse(event.body);
    }
    
    console.log(`Making ${config.method} request to ${url}`);
    
    // Make the request to Guesty API
    const response = await axios(config);
    
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data)
    };
    
  } catch (error) {
    console.error('Error in Guesty API function:', error);
    
    // Try to extract status code from axios error
    const statusCode = error.response?.status || 500;
    
    return {
      statusCode,
      body: JSON.stringify({
        message: error.message,
        error: error.response?.data || 'Internal server error'
      })
    };
  }
};
