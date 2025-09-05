
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Mail, Phone, Settings, Users } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, ROLE_COLORS } from "@/types/userManagement.types";
import { AppRole } from "@/types/permissions.types";

export const MVPUserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as AppRole
  });

  const {
    users,
    loading: isLoading,
    saving,
    updateFilters,
    createUser,
    filters
  } = useUserManagement();

  const roles = [
    { value: 'superadmin' as AppRole, label: 'Super Admin' },
    { value: 'administrator' as AppRole, label: 'Administrator' },
    { value: 'property_manager' as AppRole, label: 'Property Manager' },
    { value: 'housekeeping_staff' as AppRole, label: 'Housekeeping Staff' },
    { value: 'maintenance_staff' as AppRole, label: 'Maintenance Staff' },
    { value: 'guest' as AppRole, label: 'Guest' },
  ];

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      return;
    }

    try {
      await createUser(formData);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phone: "", role: "" as AppRole });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const getRoleLabel = (role: AppRole) => {
    return ROLE_LABELS[role] || role;
  };

  const getRoleColor = (role: AppRole) => {
    return ROLE_COLORS[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <>
      <Helmet>
        <title>User Management - Arivia Villas</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage team members and their roles</p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter user's full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter user's email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="Enter user's phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as AppRole }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreateUser}
                  disabled={saving || !formData.name || !formData.email || !formData.role}
                >
                  {saving ? "Creating User..." : "Create User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={filters.roleFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilters({ roleFilter: 'all' })}
                >
                  All Roles
                </Button>
                <Select value={filters.roleFilter} onValueChange={(value) => updateFilters({ roleFilter: value as AppRole | 'all' })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                    <div className="h-12 w-12 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {filters.searchQuery ? 'Try adjusting your search terms' : 'Start by adding team members'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-foreground">{user.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground space-x-4">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            {user.openTasksCount} open tasks
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
