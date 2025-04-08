
import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { User, UserRole } from "@/types/auth";
import { 
  loginUser as mockLoginUser,
  logoutUser as mockLogoutUser
} from "@/services/auth/userAuthService";
import { 
  checkFeatureAccess, 
  checkRolePermission, 
  updatePermissions 
} from "@/services/auth/permissionService";
import { 
  checkOfflineLoginStatus
} from "@/services/auth/offlineService";

export const login = async (
  email: string, 
  password: string,
  setUser: (user: User) => void,
  setLastAuthTime: (time: number) => void,
  setIsLoading: (loading: boolean) => void
) => {
  setIsLoading(true);
  try {
    // Try Supabase authentication first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Success! Session is handled by onAuthStateChange
    toastService.success(`Welcome back!`, {
      description: "You have successfully logged in."
    });
    
    return;
  } catch (supaError) {
    console.error("Supabase login error:", supaError);
    
    try {
      // Fall back to mock authentication for development
      const loggedInUser = await mockLoginUser(email, password);
      setUser(loggedInUser);
      setLastAuthTime(Date.now());
    } catch (error) {
      toastService.error("Login Failed", {
        description: (error as Error).message
      });
      throw error;
    }
  } finally {
    setIsLoading(false);
  }
};

export const logout = async () => {
  // Supabase signout
  await supabase.auth.signOut();
  
  // Local cleanup
  mockLogoutUser();
};

export const hasPermission = (user: User | null, roles: UserRole[]) => {
  return checkRolePermission(user, roles);
};

export const hasFeatureAccess = (user: User | null, featureKey: string) => {
  return checkFeatureAccess(user, featureKey);
};

export const updateUserPermissions = (
  user: User | null, 
  users: User[], 
  setUsers: (users: User[]) => void, 
  setUser: (user: User | null) => void, 
  userId: string, 
  permissions: Record<string, boolean>
) => {
  // Only allow superadmins to modify permissions
  if (user?.role !== "superadmin") {
    toastService.error("Permission denied", {
      description: "Only Super Admins can modify user permissions"
    });
    return;
  }
  
  const updatedUsers = updatePermissions(users, userId, permissions);
  setUsers(updatedUsers);
  
  // If the current user's permissions were updated, update the state
  if (user?.id === userId) {
    setUser({
      ...user,
      customPermissions: permissions
    });
  }
  
  toastService.success("Permissions updated", {
    description: "User permissions have been updated successfully"
  });
};

export const getOfflineLoginStatus = (user: User | null, lastAuthTime: number, isOffline: boolean) => {
  return checkOfflineLoginStatus(user, lastAuthTime, isOffline);
};
