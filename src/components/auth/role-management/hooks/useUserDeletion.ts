
import { useState } from "react";
import { User } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";

export const useUserDeletion = () => {
  const { deleteUser } = useUser();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteConfirm = async (users: User[], setUsers: (users: User[]) => void) => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const result = await deleteUser(userToDelete.id);
      if (result) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    userToDelete,
    isDeleting,
    setUserToDelete,
    handleDeleteConfirm
  };
};
