
import { useState } from "react";

export const useExpandedUsers = () => {
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  
  const toggleExpandUser = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  return {
    expandedUsers,
    toggleExpandUser
  };
};
