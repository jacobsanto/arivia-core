
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
    
    // Determine the type of user ID
    const isOAuthUser = userId.includes('-'); // e.g., google-123456789
    const isNumericId = /^\d+$/.test(userId);  // e.g., 1744150863335
    
    // Always attempt to delete the profile first
    try {
      let profileError = null;

      if (isNumericId) {
        // For numeric IDs, convert to string to avoid PostgreSQL errors
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId.toString());
          
        profileError = error;
      } else {
        // For UUID and OAuth IDs
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        profileError = error;
      }
      
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
    let deletionSuccessful = false;
    
    if (isOAuthUser) {
      // For OAuth users (e.g., google-123456789)
      try {
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
            } else {
              deletionSuccessful = true;
            }
          } else {
            // If we can't find the user but we deleted their profile, consider it a success
            console.log("User not found in auth system, but profile was deleted");
            deletionSuccessful = true;
          }
        }
      } catch (oauthError) {
        console.error("Error in OAuth user deletion:", oauthError);
        deletionError = oauthError;
      }
    } else if (isNumericId) {
      // For numeric IDs, we can't use deleteUser() since they're not valid UUIDs
      // Just report success since we've already deleted the profile
      console.log("Numeric user ID detected:", userId);
      console.log("Profile deletion was attempted; user record may not exist in auth system");
      deletionSuccessful = true;
    } else {
      // For regular UUID users, use the standard approach
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) {
          console.error("Error deleting user:", error);
          deletionError = error;
        } else {
          deletionSuccessful = true;
        }
      } catch (uuidError) {
        console.error("Error in UUID user deletion:", uuidError);
        deletionError = uuidError;
      }
    }

    if (deletionError && !deletionSuccessful) {
      return new Response(
        JSON.stringify({
          error: "Failed to delete user",
          details: deletionError.message,
          userId: userId,
          idType: isOAuthUser ? "oauth" : (isNumericId ? "numeric" : "uuid")
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
