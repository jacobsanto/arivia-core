import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { StaffMember, UserFormValues, UserFilters } from '@/types/userManagement.types';
import { AppRole } from '@/types/permissions.types';

export const useUserManagement = () => {
  const [users, setUsers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    searchQuery: '',
    roleFilter: 'all'
  });

  // Fetch users from database
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform to StaffMember format and get task counts
      const staffMembers: StaffMember[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get open tasks count for this user
          const [housekeepingTasks, maintenanceTasks] = await Promise.all([
            supabase
              .from('housekeeping_tasks')
              .select('id', { count: 'exact' })
              .eq('assigned_to', profile.user_id)
              .neq('status', 'completed'),
            supabase
              .from('maintenance_tasks')
              .select('id', { count: 'exact' })
              .eq('assigned_to', profile.user_id)
              .neq('status', 'completed')
          ]);

          const openTasksCount = 
            (housekeepingTasks.count || 0) + (maintenanceTasks.count || 0);

          return {
            id: profile.id,
            user_id: profile.user_id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            role: profile.role as AppRole,
            avatar: profile.avatar,
            isOnline: Math.random() > 0.5, // Mock online status for now
            openTasksCount,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };
        })
      );

      setUsers(staffMembers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUser = useCallback(async (userData: UserFormValues) => {
    setSaving(true);
    try {
      // Note: Creating users should be done through Supabase Auth
      // This is a temporary workaround - profiles are auto-created via trigger
      toast({
        title: "Not Implemented",
        description: "User creation should be done through the authentication system.",
        variant: "destructive",
      });
      throw new Error("User creation not implemented - use Supabase Auth signup");
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update existing user
  const updateUser = useCallback(async (userId: string, userData: UserFormValues) => {
    setSaving(true);
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              name: updatedProfile.name,
              email: updatedProfile.email,
              phone: updatedProfile.phone,
              updated_at: updatedProfile.updated_at
            }
          : user
      ));

      toast({
        title: "Success",
        description: `User "${userData.name}" has been updated successfully.`,
      });
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "Success",
        description: `User "${user.name}" has been deleted successfully.`,
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [users]);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    const matchesRole = filters.roleFilter === 'all' || user.role === filters.roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: filteredUsers,
    loading,
    saving,
    error,
    filters,
    updateFilters,
    createUser,
    updateUser,
    deleteUser,
    fetchUsers
  };
};