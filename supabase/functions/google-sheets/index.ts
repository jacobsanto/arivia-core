
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleSpreadsheet } from "https://esm.sh/@google-cloud/sheets@4.0.1";

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
    
    // Initialize the Google Sheets API
    const auth = new GoogleSpreadsheet.auth.GoogleAuth({
      credentials: parsedCredentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = new GoogleSpreadsheet.Sheets({ auth: authClient });

    let response;

    switch (method) {
      case "GET":
        // Handle read operations
        if (operation === "READ_SHEET") {
          console.log(`Reading data from spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: range || "Sheet1",
          });
          return new Response(JSON.stringify({ data: response.data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;

      case "POST":
        // Handle write operations
        if (operation === "WRITE_SHEET") {
          console.log(`Writing data to spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: range || "Sheet1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
          });
          return new Response(JSON.stringify({ success: true, updatedCells: response.data.updatedCells }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else if (operation === "APPEND_SHEET") {
          console.log(`Appending data to spreadsheet: ${spreadsheetId}, range: ${range || 'default'}`);
          response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: range || "Sheet1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
          });
          return new Response(JSON.stringify({ success: true, updatedCells: response.data.updates.updatedCells }), {
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
