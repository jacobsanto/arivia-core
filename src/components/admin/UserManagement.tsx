import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { UserRole, ROLE_DETAILS } from '@/types/auth';
import { 
  Users, 
  Plus, 
  Shield, 
  Activity, 
  Search,
  MoreVertical,
  Mail,
  Edit,
  Trash,
  UserCheck,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateUserDialog } from './users/CreateUserDialog';
import { Separator } from '@/components/ui/separator';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  avatar?: string;
  phone?: string;
  custom_permissions?: Record<string, boolean>;
}

interface ActivityRecord {
  id: string;
  action: string;
  resource_type: string;
  created_at: string;
  user_id: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'property_manager' as UserRole,
    password: ''
  });

  const fetchUsers = async () => {
    try {
      // Since profiles table doesn't exist, set empty array for now
      setUsers([]);
    } catch (error) {
      logger.error('Error fetching users', error, { component: 'UserManagement' });
      toast.error('Failed to load users');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Since user_activity_log table doesn't exist, set empty array for now
      setActivities([]);
    } catch (error) {
      logger.error('Error fetching activity', error, { component: 'UserManagement' });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRecentActivity()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const handleCreateUser = async () => {
    try {
      // Since create_user_with_role function doesn't exist, show placeholder message
      toast.error('User creation not available - database functions not configured');
      setShowCreateDialog(false);
      setNewUser({ email: '', name: '', role: 'property_manager', password: '' });
    } catch (error: any) {
      logger.error('Error creating user', error, { component: 'UserManagement' });
      toast.error(error.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Since update_user_role function doesn't exist, show placeholder message
      toast.error('Role update not available - database functions not configured');
    } catch (error: any) {
      logger.error('Error updating role', error, { component: 'UserManagement' });
      toast.error(error.message || 'Failed to update role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across the system
          </p>
        </div>
        
        <CreateUserDialog 
          isOpen={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onUserCreated={fetchUsers}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedRole} onValueChange={(value: UserRole | 'all') => setSelectedRole(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_DETAILS).map(([role, details]) => (
              <SelectItem key={role} value={role}>
                {details.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'superadmin' || u.role === 'administrator').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => 
                    new Date(a.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Recent Actions</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge variant={user.role === 'superadmin' ? 'destructive' : 'secondary'}>
                        {ROLE_DETAILS[user.role]?.title || user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invite
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.resource_type}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;