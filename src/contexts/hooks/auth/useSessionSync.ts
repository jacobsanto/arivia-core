
import { useEffect } from 'react';
import { User } from '@/types/auth/base';

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

interface UseSessionSyncProps {
  user: User | null;
  setUser: StateSetter<User | null>;
}

export const useSessionSync = ({ user, setUser }: UseSessionSyncProps) => {
  useEffect(() => {
    // Sync user session data
    const syncSession = () => {
      if (user) {
        // Save user to localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Clear user from localStorage
        localStorage.removeItem('user');
      }
    };

    syncSession();
  }, [user]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && !user) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, [setUser, user]);
};
