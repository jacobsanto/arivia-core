
// Follow Supabase Edge Function format
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API keys from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          error: "Missing environment variables. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    const { userId } = requestData;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Attempting to delete user with ID:", userId);

    // Initialize the Supabase client with the service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the user ID is from an OAuth provider (like Google)
    const isOAuthUser = userId.includes('-');
    
    // First delete the user's profile regardless of provider
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        // Continue with deletion even if profile deletion fails
      } else {
        console.log("User profile deleted successfully");
      }
    } catch (profileErr) {
      console.error("Exception when deleting profile:", profileErr);
      // Continue with deletion even if profile deletion fails
    }

    // Handle deletion based on user ID format
    let deletionError = null;
    
    if (isOAuthUser) {
      // For OAuth users, we need to use a different approach
      // First, let's get the user by their ID
      const { data: userData, error: fetchError } = await supabase.auth.admin
        .listUsers({
          filters: {
            provider: 'google'
          }
        });
      
      if (fetchError) {
        console.error("Error fetching users:", fetchError);
        deletionError = fetchError;
      } else {
        // Find the user with the matching ID
        const userToDelete = userData?.users?.find(u => u.id === userId);
        
        if (userToDelete) {
          // Delete the user using the admin API
          const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);
          if (error) {
            console.error("Error deleting OAuth user:", error);
            deletionError = error;
          }
        } else {
          // If we can't find the user but we deleted their profile, consider it a success
          console.log("User not found in auth system, but profile was deleted");
        }
      }
    } else {
      // For regular UUID users, use the standard approach
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) {
        console.error("Error deleting user:", error);
        deletionError = error;
      }
    }

    if (deletionError) {
      return new Response(
        JSON.stringify({
          error: "Failed to delete user",
          details: deletionError.message,
          userId: userId,
          isOAuthUser: isOAuthUser
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("User deleted successfully:", userId);
    
    // Return success response
    return new Response(
      JSON.stringify({ message: "User deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to delete user",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
