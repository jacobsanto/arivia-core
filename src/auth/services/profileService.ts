/**
 * Profile service - handles user profile operations
 */
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { logger } from "@/services/logger";

export class ProfileService {
  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      logger.debug('ProfileService', 'Updating profile', { userId, updates: Object.keys(updates) });
      
      // Prepare the update payload
      const updatePayload: any = {};
      
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.avatar !== undefined) updatePayload.avatar = updates.avatar;
      if (updates.phone !== undefined) updatePayload.phone = updates.phone;
      if (updates.role !== undefined) updatePayload.role = updates.role;
      // Note: secondaryRoles not implemented in current schema
      if (updates.customPermissions !== undefined) updatePayload.custom_permissions = updates.customPermissions;

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', userId);

      if (error) {
        logger.error('ProfileService', 'Profile update failed', { error: error.message, userId });
        throw error;
      }

      logger.debug('ProfileService', 'Profile updated successfully', { userId });
    } catch (error) {
      logger.error('ProfileService', 'Profile update error', { error, userId });
      throw error;
    }
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      logger.debug('ProfileService', 'Updating avatar', { userId });
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('user_id', userId);

      if (error) {
        logger.error('ProfileService', 'Avatar update failed', { error: error.message, userId });
        throw error;
      }

      logger.debug('ProfileService', 'Avatar updated successfully', { userId });
    } catch (error) {
      logger.error('ProfileService', 'Avatar update error', { error, userId });
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        logger.error('ProfileService', 'Error getting profile', { error: error.message, userId });
        return null;
      }

      if (!profile) {
        logger.warn('ProfileService', 'No profile found', { userId });
        return null;
      }

      // Get user email from auth.users (via RPC or direct query)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const email = user?.email || '';

      return {
        id: userId,
        email,
        name: profile.name || email.split('@')[0] || 'User',
        role: profile.role as UserRole || 'housekeeping_staff',
        avatar: profile.avatar || "/placeholder.svg",
        phone: profile.phone,
        secondaryRoles: undefined, // Not implemented in current schema
        customPermissions: profile.custom_permissions as Record<string, boolean> || {}
      };
    } catch (error) {
      logger.error('ProfileService', 'Profile fetch error', { error, userId });
      return null;
    }
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      logger.debug('ProfileService', 'Deleting profile', { userId });
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('ProfileService', 'Profile deletion failed', { error: error.message, userId });
        throw error;
      }

      logger.debug('ProfileService', 'Profile deleted successfully', { userId });
    } catch (error) {
      logger.error('ProfileService', 'Profile deletion error', { error, userId });
      throw error;
    }
  }

  /**
   * Update user permissions
   */
  async updatePermissions(userId: string, permissions: Record<string, boolean>): Promise<void> {
    try {
      logger.debug('ProfileService', 'Updating permissions', { userId, permissionCount: Object.keys(permissions).length });
      
      const { error } = await supabase
        .from('profiles')
        .update({ custom_permissions: permissions })
        .eq('user_id', userId);

      if (error) {
        logger.error('ProfileService', 'Permission update failed', { error: error.message, userId });
        throw error;
      }

      logger.debug('ProfileService', 'Permissions updated successfully', { userId });
    } catch (error) {
      logger.error('ProfileService', 'Permission update error', { error, userId });
      throw error;
    }
  }

  /**
   * Get all user profiles (for admin use)
   */
  async getAllProfiles(): Promise<User[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        logger.error('ProfileService', 'Error getting all profiles', { error: error.message });
        return [];
      }

      return profiles.map(profile => ({
        id: profile.user_id,
        email: profile.email || '',
        name: profile.name || 'User',
        role: profile.role as UserRole || 'housekeeping_staff',
        avatar: profile.avatar || "/placeholder.svg",
        phone: profile.phone,
        secondaryRoles: undefined, // Not implemented in current schema
        customPermissions: profile.custom_permissions as Record<string, boolean> || {}
      }));
    } catch (error) {
      logger.error('ProfileService', 'Error fetching all profiles', { error });
      return [];
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();