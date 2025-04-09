
import { User, UserRole, Session } from "@/types/auth";

export interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>; // Added the missing signup method
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  getOfflineLoginStatus: () => boolean;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => void;
  updateUserAvatar: (userId: string, avatarUrl: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  syncUserProfile: () => Promise<boolean>;
  updateProfile: (userId: string, profileData: Partial<{
    name: string;
    email: string;
    role: UserRole;
    secondaryRoles?: UserRole[];
  }>) => Promise<boolean>;
  refreshProfile: () => Promise<boolean>;
}
