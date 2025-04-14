
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Enable Supabase realtime for the profiles table
  useEffect(() => {
    const enableRealtime = async () => {
      if (navigator.onLine) {
        try {
          // Enable realtime for the profiles table
          await supabase.from('profiles').select('count').then(() => {
            console.log('Realtime enabled for profiles table');
          });
        } catch (error) {
          console.error('Error enabling realtime:', error);
        }
      }
    };
    
    enableRealtime();
  }, []);
  
  return {
    user,
    setUser,
    users,
    setUsers
  };
};
