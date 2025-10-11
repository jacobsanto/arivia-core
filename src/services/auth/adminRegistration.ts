// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/services/logger";

export const checkSuperAdminExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'superadmin')
      .maybeSingle();
    
    if (error) {
      logger.error("Error checking for super admin", error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    logger.error("Error checking for super admin", error);
    // Default to true as a safety measure
    return true;
  }
};

export const registerSuperAdmin = async (
  email: string,
  password: string,
  name: string
): Promise<boolean> => {
  try {
    logger.info("Registering super admin", { email, name }, { component: 'adminRegistration' });
    const role = "superadmin";
    
    // Check if super admin already exists
    const superAdminExists = await checkSuperAdminExists();
    
    // If super admin already exists, don't create a new one
    if (superAdminExists) {
      logger.info("Super admin already exists", undefined, { component: 'adminRegistration' });
      toast.info("Super Admin already exists", {
        description: "A Super Admin user is already registered in the system."
      });
      return false;
    }
    
    // Register the Super Admin with Supabase
    logger.info("Creating super admin account", undefined, { component: 'adminRegistration' });
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
      logger.error("Error creating Super Admin", error, { component: 'adminRegistration' });
      toast.error("Failed to create Super Admin", {
        description: error.message
      });
      return false;
    }

    logger.info("Super Admin created successfully", { userId: data.user?.id }, { component: 'adminRegistration' });
    toast.success("Super Admin created successfully", {
      description: `The Super Admin account for ${name} has been registered.`
    });
    
    return true;
  } catch (error) {
    logger.error("Super Admin registration error", error, { component: 'adminRegistration' });
    toast.error("Failed to create Super Admin", {
      description: "An unexpected error occurred."
    });
    return false;
  }
};
