
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Google Sheets credentials from environment variables
    const credentials = Deno.env.get("GOOGLE_SHEETS_CREDENTIALS");
    if (!credentials) {
      throw new Error("Google Sheets credentials not found");
    }

    const { method, operation, spreadsheetId, sheetId, range, values } = await req.json();
    console.log(`Processing ${method} request for operation: ${operation}`);

    // Parse the credentials
    const parsedCredentials = JSON.parse(credentials);
    
    // Create headers for Google Sheets API requests
    const headers = new Headers({
      'Authorization': `Bearer ${parsedCredentials.private_key ? await getAccessToken(parsedCredentials) : parsedCredentials.access_token}`,
      'Content-Type': 'application/json',
    });

    const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";
    let response;

    switch (method) {
      case "GET":
        // Handle read operations
        if (operation === "READ_SHEET") {
          console.log(`Reading data from spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          
          const readUrl = `${baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range || "Sheet1")}`;
          const readResponse = await fetch(readUrl, { headers });
          
          if (!readResponse.ok) {
            throw new Error(`Failed to read spreadsheet: ${await readResponse.text()}`);
          }
          
          const data = await readResponse.json();
          
          return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;

      case "POST":
        // Handle write operations
        if (operation === "WRITE_SHEET") {
          console.log(`Writing data to spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          
          const writeUrl = `${baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range || "Sheet1")}?valueInputOption=USER_ENTERED`;
          const writeResponse = await fetch(writeUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({ values }),
          });
          
          if (!writeResponse.ok) {
            throw new Error(`Failed to write to spreadsheet: ${await writeResponse.text()}`);
          }
          
          const writeData = await writeResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            updatedCells: writeData.updatedCells 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "APPEND_SHEET") {
          console.log(`Appending data to spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          
          const appendUrl = `${baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range || "Sheet1")}:append?valueInputOption=USER_ENTERED`;
          const appendResponse = await fetch(appendUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ values }),
          });
          
          if (!appendResponse.ok) {
            throw new Error(`Failed to append to spreadsheet: ${await appendResponse.text()}`);
          }
          
          const appendData = await appendResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            updatedCells: appendData.updates?.updatedCells || 0
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid method" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }

    return new Response(JSON.stringify({ error: "Invalid operation" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Error in Google Sheets function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to get an access token from service account credentials
async function getAccessToken(credentials) {
  try {
    // Create JWT claim
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };
    
    // Sign JWT
    const encoder = new TextEncoder();
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');
    
    const header = encoder.encode(
      JSON.stringify({ alg: "RS256", typ: "JWT" })
    );
    const payload = encoder.encode(JSON.stringify(claim));
    
    const headerBase64 = btoa(String.fromCharCode(...header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const payloadBase64 = btoa(String.fromCharCode(...payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    const signatureInput = `${headerBase64}.${payloadBase64}`;
    
    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(privateKey),
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      importedKey,
      encoder.encode(signatureInput)
    );
    
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    
    const jwt = `${headerBase64}.${payloadBase64}.${signature}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Token request failed: ${await tokenResponse.text()}`);
    }
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Helper function to convert PEM to ArrayBuffer
function pemToArrayBuffer(pem) {
  // Remove the first and last lines and newlines
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  // Base64 decode
  const binary = atob(base64);
  
  // Convert to ArrayBuffer
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  
  return buffer.buffer;
}
