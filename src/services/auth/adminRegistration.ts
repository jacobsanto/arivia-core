
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const registerSuperAdmin = async (): Promise<boolean> => {
  try {
    const email = "iakovos@ariviagroup.com";
    const password = "Lilakimou13@";
    const name = "Iakovos Kalaitzakis";
    const role = "superadmin";
    
    // Check if super admin already exists
    const { data: existingSuperAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking for existing super admin:", checkError);
      toast.error("Failed to check for existing super admin");
      return false;
    }
    
    // If super admin already exists, don't create a new one
    if (existingSuperAdmin) {
      console.log("Super admin already exists");
      toast.info("Super Admin already exists", {
        description: "A Super Admin user is already registered in the system."
      });
      return false;
    }
    
    // Register the Super Admin with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          secondaryRoles: ["administrator"]
        },
      }
    });

    if (error) {
      console.error("Error creating Super Admin:", error);
      toast.error("Failed to create Super Admin", {
        description: error.message
      });
      return false;
    }

    toast.success("Super Admin created successfully", {
      description: "The Super Admin user has been registered."
    });
    
    return true;
  } catch (error) {
    console.error("Super Admin registration error:", error);
    toast.error("Failed to create Super Admin", {
      description: "An unexpected error occurred."
    });
    return false;
  }
};
