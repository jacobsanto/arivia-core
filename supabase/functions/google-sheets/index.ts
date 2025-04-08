
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

    const requestBody = await req.json();
    const { method, operation, spreadsheetId, range, values, batchRequests, name, rangeDefinition, backupTitle } = requestBody;
    
    // Extract the actual spreadsheet ID from URL if needed
    const extractedId = extractSpreadsheetId(spreadsheetId);
    console.log(`Processing ${method} request for operation: ${operation} with spreadsheet ID: ${extractedId}`);

    // Parse the credentials
    const parsedCredentials = JSON.parse(credentials);
    
    // Create headers for Google Sheets API requests
    const headers = new Headers({
      'Authorization': `Bearer ${parsedCredentials.private_key ? await getAccessToken(parsedCredentials) : parsedCredentials.access_token}`,
      'Content-Type': 'application/json',
    });

    const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets";
    
    switch (method) {
      case "GET":
        // Handle read operations
        if (operation === "READ_SHEET") {
          console.log(`Reading data from spreadsheet: ${extractedId}, range: ${range || 'default'}`);
          
          const readUrl = `${baseUrl}/${extractedId}/values/${encodeURIComponent(range || "Sheet1")}`;
          console.log(`API request URL: ${readUrl}`);
          
          const readResponse = await fetch(readUrl, { headers });
          
          if (!readResponse.ok) {
            const errorText = await readResponse.text();
            console.error(`Error response: ${readResponse.status} ${errorText}`);
            throw new Error(`Failed to read spreadsheet: ${errorText}`);
          }
          
          const data = await readResponse.json();
          
          return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "GET_SHEETS_LIST") {
          console.log(`Getting sheets list for spreadsheet: ${extractedId}`);
          
          const sheetsUrl = `${baseUrl}/${extractedId}?fields=sheets.properties`;
          console.log(`API request URL: ${sheetsUrl}`);
          
          const sheetsResponse = await fetch(sheetsUrl, { headers });
          
          if (!sheetsResponse.ok) {
            const errorText = await sheetsResponse.text();
            console.error(`Error response: ${sheetsResponse.status} ${errorText}`);
            throw new Error(`Failed to get sheets list: ${errorText}`);
          }
          
          const sheetsData = await sheetsResponse.json();
          const sheetsList = sheetsData.sheets.map((sheet: any) => ({
            id: sheet.properties.sheetId,
            title: sheet.properties.title,
            index: sheet.properties.index,
            hidden: sheet.properties.hidden || false,
          }));
          
          return new Response(JSON.stringify({ sheets: sheetsList }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "GET_SPREADSHEET_METADATA") {
          console.log(`Getting metadata for spreadsheet: ${extractedId}`);
          
          // We'll request different fields depending on what we need
          const metadataUrl = `${baseUrl}/${extractedId}?fields=properties,sheets.properties,namedRanges`;
          console.log(`API request URL: ${metadataUrl}`);
          
          const metadataResponse = await fetch(metadataUrl, { headers });
          
          if (!metadataResponse.ok) {
            const errorText = await metadataResponse.text();
            console.error(`Error response: ${metadataResponse.status} ${errorText}`);
            throw new Error(`Failed to get spreadsheet metadata: ${errorText}`);
          }
          
          const metadata = await metadataResponse.json();
          
          return new Response(JSON.stringify({ metadata }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "GET_NAMED_RANGES") {
          console.log(`Getting named ranges for spreadsheet: ${extractedId}`);
          
          const namedRangesUrl = `${baseUrl}/${extractedId}?fields=namedRanges`;
          console.log(`API request URL: ${namedRangesUrl}`);
          
          const namedRangesResponse = await fetch(namedRangesUrl, { headers });
          
          if (!namedRangesResponse.ok) {
            const errorText = await namedRangesResponse.text();
            console.error(`Error response: ${namedRangesResponse.status} ${errorText}`);
            throw new Error(`Failed to get named ranges: ${errorText}`);
          }
          
          const namedRangesData = await namedRangesResponse.json();
          
          return new Response(JSON.stringify({ namedRanges: namedRangesData.namedRanges || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;

      case "POST":
        // Handle write operations
        if (operation === "WRITE_SHEET") {
          console.log(`Writing data to spreadsheet: ${extractedId}, range: ${range || 'default'}`);
          
          const writeUrl = `${baseUrl}/${extractedId}/values/${encodeURIComponent(range || "Sheet1")}?valueInputOption=USER_ENTERED`;
          console.log(`API request URL: ${writeUrl}`);
          
          const writeResponse = await fetch(writeUrl, {
            method: "PUT",
            headers,
            body: JSON.stringify({ values }),
          });
          
          if (!writeResponse.ok) {
            const errorText = await writeResponse.text();
            console.error(`Error response: ${writeResponse.status} ${errorText}`);
            throw new Error(`Failed to write to spreadsheet: ${errorText}`);
          }
          
          const writeData = await writeResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            updatedCells: writeData.updatedCells 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "APPEND_SHEET") {
          console.log(`Appending data to spreadsheet: ${extractedId}, range: ${range || 'default'}`);
          
          const appendUrl = `${baseUrl}/${extractedId}/values/${encodeURIComponent(range || "Sheet1")}:append?valueInputOption=USER_ENTERED`;
          console.log(`API request URL: ${appendUrl}`);
          
          const appendResponse = await fetch(appendUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ values }),
          });
          
          if (!appendResponse.ok) {
            const errorText = await appendResponse.text();
            console.error(`Error response: ${appendResponse.status} ${errorText}`);
            throw new Error(`Failed to append to spreadsheet: ${errorText}`);
          }
          
          const appendData = await appendResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            updatedCells: appendData.updates?.updatedCells || 0
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "BATCH_UPDATE") {
          console.log(`Processing batch update for spreadsheet: ${extractedId}`);
          
          if (!batchRequests || !Array.isArray(batchRequests) || batchRequests.length === 0) {
            throw new Error("Batch requests array is required and must not be empty");
          }
          
          const batchUrl = `${baseUrl}/${extractedId}:batchUpdate`;
          console.log(`API request URL: ${batchUrl}`);
          console.log(`Batch requests: ${JSON.stringify(batchRequests).substring(0, 200)}...`);
          
          const batchResponse = await fetch(batchUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ requests: batchRequests }),
          });
          
          if (!batchResponse.ok) {
            const errorText = await batchResponse.text();
            console.error(`Error response: ${batchResponse.status} ${errorText}`);
            throw new Error(`Failed to perform batch update: ${errorText}`);
          }
          
          const batchData = await batchResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            responses: batchData.replies || []
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "CREATE_NAMED_RANGE") {
          console.log(`Creating named range in spreadsheet: ${extractedId}`);
          
          if (!name || !rangeDefinition) {
            throw new Error("Name and range definition are required for creating a named range");
          }
          
          const namedRangeRequest = {
            requests: [
              {
                addNamedRange: {
                  namedRange: {
                    name,
                    range: rangeDefinition,
                  },
                },
              },
            ],
          };
          
          const namedRangeUrl = `${baseUrl}/${extractedId}:batchUpdate`;
          console.log(`API request URL: ${namedRangeUrl}`);
          
          const namedRangeResponse = await fetch(namedRangeUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(namedRangeRequest),
          });
          
          if (!namedRangeResponse.ok) {
            const errorText = await namedRangeResponse.text();
            console.error(`Error response: ${namedRangeResponse.status} ${errorText}`);
            throw new Error(`Failed to create named range: ${errorText}`);
          }
          
          const namedRangeData = await namedRangeResponse.json();
          
          return new Response(JSON.stringify({ 
            success: true, 
            namedRangeId: namedRangeData.replies?.[0]?.addNamedRange?.namedRange?.namedRangeId 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "CLEAR_RANGE") {
          console.log(`Clearing range in spreadsheet: ${extractedId}, range: ${range}`);
          
          const clearUrl = `${baseUrl}/${extractedId}/values/${encodeURIComponent(range)}:clear`;
          console.log(`API request URL: ${clearUrl}`);
          
          const clearResponse = await fetch(clearUrl, {
            method: "POST",
            headers,
          });
          
          if (!clearResponse.ok) {
            const errorText = await clearResponse.text();
            console.error(`Error response: ${clearResponse.status} ${errorText}`);
            throw new Error(`Failed to clear range: ${errorText}`);
          }
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "CREATE_BACKUP") {
          console.log(`Creating backup of spreadsheet: ${extractedId}`);
          
          // Create a new spreadsheet
          const title = backupTitle || `Backup of ${extractedId} - ${new Date().toISOString().split('T')[0]}`;
          
          // We first need to get the original spreadsheet to copy its structure
          const getUrl = `${baseUrl}/${extractedId}`;
          console.log(`API request URL for getting original: ${getUrl}`);
          
          const getResponse = await fetch(getUrl, { headers });
          
          if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.error(`Error response: ${getResponse.status} ${errorText}`);
            throw new Error(`Failed to get spreadsheet for backup: ${errorText}`);
          }
          
          const originalSheet = await getResponse.json();
          
          // Now create a new spreadsheet
          const createUrl = "https://sheets.googleapis.com/v4/spreadsheets";
          console.log(`API request URL for creating backup: ${createUrl}`);
          
          const createResponse = await fetch(createUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              properties: {
                title,
              },
              sheets: originalSheet.sheets.map((sheet: any) => ({
                properties: {
                  title: sheet.properties.title,
                  gridProperties: sheet.properties.gridProperties,
                }
              }))
            }),
          });
          
          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error(`Error response: ${createResponse.status} ${errorText}`);
            throw new Error(`Failed to create backup spreadsheet: ${errorText}`);
          }
          
          const backupSheet = await createResponse.json();
          const backupId = backupSheet.spreadsheetId;
          
          // Now copy data from each sheet
          for (const sheet of originalSheet.sheets) {
            const sheetName = sheet.properties.title;
            
            // Get data from original
            const dataUrl = `${baseUrl}/${extractedId}/values/${encodeURIComponent(sheetName)}`;
            console.log(`Getting data for sheet ${sheetName} from: ${dataUrl}`);
            
            const dataResponse = await fetch(dataUrl, { headers });
            
            if (!dataResponse.ok) {
              console.warn(`Warning: Could not copy data for sheet ${sheetName}: ${await dataResponse.text()}`);
              continue;
            }
            
            const sheetData = await dataResponse.json();
            
            if (sheetData.values && sheetData.values.length > 0) {
              // Write to backup
              const writeUrl = `${baseUrl}/${backupId}/values/${encodeURIComponent(sheetName)}?valueInputOption=RAW`;
              console.log(`Writing data to backup sheet ${sheetName}: ${writeUrl}`);
              
              const writeResponse = await fetch(writeUrl, {
                method: "PUT",
                headers,
                body: JSON.stringify({ values: sheetData.values }),
              });
              
              if (!writeResponse.ok) {
                console.warn(`Warning: Could not write data to backup sheet ${sheetName}: ${await writeResponse.text()}`);
              }
            }
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            backupSpreadsheetId: backupId,
            title
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

// Helper function to extract the spreadsheet ID from a URL or return the ID as is
function extractSpreadsheetId(input: string): string {
  if (!input) {
    throw new Error("Spreadsheet ID is required");
  }
  
  // Check if it's a URL
  if (input.includes('docs.google.com/spreadsheets/d/')) {
    // Extract the ID from the URL
    const matches = input.match(/\/d\/([\w-]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }
    
    // For edit URLs
    const editMatches = input.match(/spreadsheets\/d\/([\w-]+)/);
    if (editMatches && editMatches[1]) {
      return editMatches[1];
    }
    
    throw new Error("Invalid Google Sheets URL format");
  }
  
  // If it's not a URL, assume it's already an ID
  return input;
}

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
