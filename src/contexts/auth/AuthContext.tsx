
import React, { createContext, useContext } from "react";
import { UserProvider } from "./UserContext";

// This is a wrapper component that provides all auth-related contexts
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};
