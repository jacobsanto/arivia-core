
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google API endpoints
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3'
const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'

// Template structure for different entity types
const TEMPLATES = {
  inventory: {
    sheets: [
      { title: "Items", headers: ["ID", "Name", "Category", "Stock Level", "Min Stock", "Max Stock", "Unit Cost", "Last Updated"] },
      { title: "Categories", headers: ["ID", "Name", "Description"] },
      { title: "Vendors", headers: ["ID", "Name", "Contact", "Email", "Phone", "Address", "Status"] },
    ]
  },
  properties: {
    sheets: [
      { title: "Properties", headers: ["ID", "Name", "Address", "City", "Country", "Type", "Bedrooms", "Bathrooms", "Max Guests", "Status"] },
      { title: "Amenities", headers: ["PropertyID", "Amenity", "Description", "Status"] },
      { title: "PricingConfig", headers: ["PropertyID", "Season", "StartDate", "EndDate", "BasePrice", "MinStay"] },
    ]
  },
  maintenance: {
    sheets: [
      { title: "Tasks", headers: ["ID", "Title", "PropertyID", "Description", "Priority", "Status", "CreatedAt", "DueDate", "AssignedTo"] },
      { title: "History", headers: ["TaskID", "Action", "Timestamp", "User", "Notes"] },
      { title: "Tools", headers: ["TaskID", "ToolName", "Quantity", "Notes"] },
    ]
  }
}

// Helper function to get credentials from Supabase secrets
async function getGoogleCredentials() {
  const googleCredentialsStr = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS')
  if (!googleCredentialsStr) {
    throw new Error('Missing Google credentials')
  }
  return JSON.parse(googleCredentialsStr)
}

// Function to generate a new access token using service account credentials
async function getAccessToken() {
  try {
    const credentials = await getGoogleCredentials()
    
    // Create JWT claim
    const now = Math.floor(Date.now() / 1000)
    const claim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
      aud: GOOGLE_TOKEN_ENDPOINT,
      exp: now + 3600,
      iat: now,
    }
    
    // Sign the JWT
    const encoder = new TextEncoder()
    const header = encoder.encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const payload = encoder.encode(JSON.stringify(claim))
    
    const base64Url = (buffer: Uint8Array): string => 
      btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    
    // Convert private key to proper format
    const privateKey = credentials.private_key.replace(/\\n/g, '\n')
    
    // Create crypto key from private key
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // Create signature
    const headerBase64 = base64Url(header)
    const payloadBase64 = base64Url(payload)
    const toSign = encoder.encode(`${headerBase64}.${payloadBase64}`)
    const signature = await crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      cryptoKey,
      toSign
    )
    
    // Create the full JWT
    const jwt = `${headerBase64}.${payloadBase64}.${base64Url(new Uint8Array(signature))}`
    
    // Exchange JWT for access token
    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Token response:', data)
      throw new Error(`Failed to get access token: ${data.error_description || data.error || 'Unknown error'}`)
    }
    
    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

// Create a folder in Google Drive
async function createFolder(folderName: string, parentId?: string) {
  try {
    const accessToken = await getAccessToken()
    
    const metadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }
    
    if (parentId) {
      Object.assign(metadata, { parents: [parentId] })
    }
    
    const response = await fetch(`${GOOGLE_DRIVE_API}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to create folder: ${data.error?.message || 'Unknown error'}`)
    }
    
    return data
  } catch (error) {
    console.error('Error creating folder:', error)
    throw error
  }
}

// Check if folder exists and return its ID
async function findFolder(folderName: string) {
  try {
    const accessToken = await getAccessToken()
    
    const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    
    const response = await fetch(
      `${GOOGLE_DRIVE_API}/files?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to find folder: ${data.error?.message || 'Unknown error'}`)
    }
    
    if (data.files && data.files.length > 0) {
      return data.files[0]
    }
    
    return null
  } catch (error) {
    console.error('Error finding folder:', error)
    throw error
  }
}

// Create a new empty Google Sheet
async function createSpreadsheet(title: string, folderId: string, template: string) {
  try {
    const accessToken = await getAccessToken()
    
    // Create template sheets based on entity type
    const sheets = TEMPLATES[template as keyof typeof TEMPLATES]?.sheets || [{ title: "Sheet1", headers: ["ID", "Name"] }]
    
    // Prepare the request body
    const requestBody = {
      properties: {
        title: `${title} - ${new Date().toISOString().split('T')[0]}`,
      },
      sheets: sheets.map(sheet => ({
        properties: {
          title: sheet.title,
        }
      })),
    }
    
    // Create the spreadsheet
    const response = await fetch(GOOGLE_SHEETS_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to create spreadsheet: ${data.error?.message || 'Unknown error'}`)
    }
    
    // Move the spreadsheet to the specified folder
    await moveFile(data.spreadsheetId, folderId)
    
    // Add headers to each sheet
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i]
      await updateSheetValues(
        data.spreadsheetId,
        `${sheet.title}!A1:${String.fromCharCode(65 + sheet.headers.length - 1)}1`,
        [sheet.headers]
      )
    }
    
    return data
  } catch (error) {
    console.error('Error creating spreadsheet:', error)
    throw error
  }
}

// Move a file to a specific folder
async function moveFile(fileId: string, folderId: string) {
  try {
    const accessToken = await getAccessToken()
    
    // Get the current parents
    const fileResponse = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}?fields=parents`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
    
    const file = await fileResponse.json()
    
    // Move the file to the new folder
    const moveResponse = await fetch(
      `${GOOGLE_DRIVE_API}/files/${fileId}?addParents=${folderId}&removeParents=${file.parents.join(',')}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!moveResponse.ok) {
      const errorData = await moveResponse.json()
      throw new Error(`Failed to move file: ${errorData.error?.message || 'Unknown error'}`)
    }
    
    return await moveResponse.json()
  } catch (error) {
    console.error('Error moving file:', error)
    throw error
  }
}

// Update values in a Google Sheet
async function updateSheetValues(spreadsheetId: string, range: string, values: any[][]) {
  try {
    const accessToken = await getAccessToken()
    
    const response = await fetch(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to update sheet values: ${data.error?.message || 'Unknown error'}`)
    }
    
    return data
  } catch (error) {
    console.error('Error updating sheet values:', error)
    throw error
  }
}

// Append values to a Google Sheet
async function appendSheetValues(spreadsheetId: string, range: string, values: any[][]) {
  try {
    const accessToken = await getAccessToken()
    
    const response = await fetch(
      `${GOOGLE_SHEETS_API}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`Failed to append values: ${data.error?.message || 'Unknown error'}`)
    }
    
    return data
  } catch (error) {
    console.error('Error appending values:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }
  
  try {
    const url = new URL(req.url)
    
    // Extract the operation from the URL path
    const pathParts = url.pathname.split('/')
    const operation = pathParts[pathParts.length - 1]
    
    if (req.method === 'POST') {
      const requestData = await req.json()
      
      switch (operation) {
        case 'create-folder': {
          const { name, parentId } = requestData
          const folder = await createFolder(name, parentId)
          return new Response(JSON.stringify({ success: true, folder }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
        
        case 'find-folder': {
          const { name } = requestData
          const folder = await findFolder(name)
          return new Response(JSON.stringify({ success: true, folder }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
        
        case 'create-spreadsheet': {
          const { title, folderId, template } = requestData
          const spreadsheet = await createSpreadsheet(title, folderId, template)
          return new Response(JSON.stringify({ success: true, spreadsheet }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
        
        case 'update-sheet': {
          const { spreadsheetId, range, values } = requestData
          const result = await updateSheetValues(spreadsheetId, range, values)
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
        
        case 'append-sheet': {
          const { spreadsheetId, range, values } = requestData
          const result = await appendSheetValues(spreadsheetId, range, values)
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          })
        }
        
        default:
          return new Response(JSON.stringify({ error: 'Operation not supported' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
      }
    } else if (req.method === 'GET' && operation === 'test') {
      return new Response(JSON.stringify({ message: 'Google Drive API is working!' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }
  } catch (error) {
    console.error('Error handling request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
