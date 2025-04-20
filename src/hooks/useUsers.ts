
import { useUser } from "@/contexts/UserContext";
import { useContext } from "react";

export const useUsers = () => {
  const context = useUser();
  const registeredUsers = context.user ? [context.user] : [];
  
  return {
    registeredUsers,
    isLoading: false
  };
};
