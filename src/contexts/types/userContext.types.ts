
import { User, UserRole } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

export interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role?: UserRole) => Promise<any>;
  logout: () => Promise<void>;
  hasPermission: (roles: UserRole[]) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  getOfflineLoginStatus: () => { isOfflineLoggedIn: boolean; timeRemaining: number };
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => Promise<boolean>;
  updateUserAvatar: (userId: string, avatarUrl: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  syncUserProfile: () => Promise<boolean>;
  updateProfile: (
    userId: string,
    profileData: Partial<{
      name: string;
      email: string;
      role: UserRole;
      secondaryRoles?: UserRole[];
      customPermissions?: Record<string, boolean>;
    }>
  ) => Promise<boolean>;
  refreshProfile: () => Promise<boolean>;
}
