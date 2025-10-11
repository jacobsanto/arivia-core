
import { User, UserRole } from "@/types/auth";
import { toastService } from "@/services/toast/toast.service";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

// All user authentication is now handled through Supabase Auth
// Users must sign up through the proper registration flow

// Authentication functions using Supabase Auth
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("No user data returned");
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to fetch user profile");
    }

    const user: User = {
      id: profile.user_id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone: profile.phone,
      customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
    };

    toastService.success(`Welcome, ${user.name}`, {
      description: "You have successfully logged in."
    });

    return user;
  } catch (error) {
    logger.error("Login error", error, { component: 'auth' });
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    
    toastService.info("Logged Out", {
      description: "You have been successfully logged out."
    });
    
    // Force redirect to login page
    window.location.href = "/login";
  } catch (error) {
    logger.error("Logout error", error, { component: 'auth' });
    throw error;
  }
};

export const getUserFromStorage = async (): Promise<{ user: User | null; lastAuthTime: number }> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return { user: null, lastAuthTime: 0 };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError || !profile) {
      logger.error("Failed to fetch user profile", profileError, { component: 'auth' });
      return { user: null, lastAuthTime: 0 };
    }

    const user: User = {
      id: profile.user_id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      avatar: profile.avatar,
      phone: profile.phone,
      customPermissions: (profile.custom_permissions as Record<string, boolean>) || {}
    };

    return { user, lastAuthTime: Date.now() };
  } catch (error) {
    logger.error("Get user from storage error", error, { component: 'auth' });
    return { user: null, lastAuthTime: 0 };
  }
};
