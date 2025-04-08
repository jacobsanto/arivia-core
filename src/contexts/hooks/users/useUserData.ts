
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { MOCK_USERS } from "@/services/auth/userAuthService";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Initialize user state
  useEffect(() => {
    // Load initial users from localStorage or initialize with MOCK_USERS
    const storedUsers = localStorage.getItem("users");
    const initialUsers = storedUsers ? JSON.parse(storedUsers) : MOCK_USERS;
    setUsers(initialUsers);
  }, []);
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("users", JSON.stringify(users));
    }
  }, [users]);

  return {
    user,
    setUser,
    users,
    setUsers
  };
};
