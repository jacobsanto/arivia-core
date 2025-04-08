
import { User, UserRole, Session } from "@/types/auth";

export interface UserContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (roles: UserRole[]) => boolean;
  hasFeatureAccess: (featureKey: string) => boolean;
  getOfflineLoginStatus: () => boolean;
  updateUserPermissions: (userId: string, permissions: Record<string, boolean>) => void;
}
