/**
 * Profile hook - handles profile operations
 */
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

export const useProfile = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within an AuthProvider');
  }
  
  return {
    // Profile data
    user: context.user,
    
    // Profile operations
    updateProfile: context.updateProfile,
    updateUserAvatar: context.updateUserAvatar,
    refreshProfile: context.refreshProfile,
    deleteUserProfile: context.deleteUserProfile,
  };
};