
import { useUser } from "@/contexts/UserContext";

export const useUsers = () => {
  const context = useUser();
  const registeredUsers = context.user ? [context.user] : [];
  
  return {
    registeredUsers,
    isLoading: false
  };
};
