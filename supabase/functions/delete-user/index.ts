
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Delete user function loaded")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseServiceRoleKey) {
      console.error("Service role key missing")
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    
    // Verify request headers and permissions
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error("Missing authorization header")
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get the request body
    const { userId } = await req.json()
    
    if (!userId) {
      console.error("Missing userId in request body")
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Request to delete user: ${userId}`)
    
    // Delete user's storage folder if it exists
    try {
      console.log(`Checking for user's files in storage...`)
      const { data: storageData, error: storageError } = await supabase.storage
        .from('avatars')
        .list(`${userId}/`)
      
      if (!storageError && storageData && storageData.length > 0) {
        console.log(`Found ${storageData.length} files in user's storage folder`)
        
        const filesToDelete = storageData.map(file => `${userId}/${file.name}`)
        console.log('Files to delete:', filesToDelete)
        
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete)
        
        if (deleteError) {
          console.error("Error deleting user files:", deleteError)
        } else {
          console.log(`Deleted ${filesToDelete.length} files for user`)
        }
      } else if (storageError) {
        console.log("Error or no files found when checking storage:", storageError)
      } else {
        console.log("No files found in user's storage folder")
      }
    } catch (storageError) {
      console.error("Error handling user storage:", storageError)
      // Continue with user deletion even if storage cleanup fails
    }
    
    // First delete profile (Row Level Security may prevent this otherwise)
    console.log(`Deleting profile for user: ${userId}`)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      
    if (profileError) {
      console.error("Error deleting profile:", profileError)
      // Don't return early - we'll still try to delete the auth user
    } else {
      console.log(`Profile deleted successfully for user: ${userId}`)
    }
    
    // Wait a short moment to allow the delete to propagate
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Attempt to delete the user from auth.users
    console.log(`Deleting auth user: ${userId}`)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      console.error("Error deleting auth user:", authError)
      
      // Check for non-critical errors we can ignore
      if (authError.message && authError.message.includes('not found')) {
        // User already deleted or never existed
        return new Response(
          JSON.stringify({ 
            message: "User partially deleted",
            details: "User record may have already been deleted or didn't exist" 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // All operations completed successfully
    console.log(`User ${userId} successfully deleted`)
    return new Response(
      JSON.stringify({ 
        message: "User successfully deleted",
        userId: userId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in delete-user function:", error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error occurred",
        details: error.stack || "No stack trace available"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
