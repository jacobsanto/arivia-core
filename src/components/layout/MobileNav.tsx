
import React from "react";
import { useUser } from "@/contexts/auth/UserContext";

// Dummy component for mobile navigation
const MobileNav = () => {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <div className="lg:hidden">
      {user.pendingApproval && (
        <div className="text-xs p-1 bg-yellow-100 text-yellow-800 rounded">
          Account pending approval
        </div>
      )}
    </div>
  );
};

export default MobileNav;
