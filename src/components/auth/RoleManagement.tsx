
import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { UserRole, ROLE_DETAILS, User } from "@/types/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertTriangle, Users, Sliders, Trash2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PermissionManagement from "./PermissionManagement";
import AvatarUpload from "./AvatarUpload";

// Mock user list for demonstration
const MOCK_USER_LIST: User[] = [
  { id: "1", email: "admin@ariviavillas.com", name: "Admin User", role: "administrator" },
  { id: "2", email: "manager@ariviavillas.com", name: "Property Manager", role: "property_manager" },
  { id: "3", email: "concierge@ariviavillas.com", name: "Concierge Staff", role: "concierge" },
  { id: "4", email: "housekeeping@ariviavillas.com", name: "Housekeeping Staff", role: "housekeeping_staff" },
  { id: "5", email: "maintenance@ariviavillas.com", name: "Maintenance Staff", role: "maintenance_staff" },
  { id: "6", email: "inventory@ariviavillas.com", name: "Inventory Manager", role: "inventory_manager" },
  { 
    id: "7", 
    email: "superadmin@ariviavillas.com", 
    name: "Super Admin", 
    role: "superadmin",
    secondaryRoles: ["administrator"] 
  },
];

const RoleManagement: React.FC = () => {
  const { user, deleteUser } = useUser();
  const [users, setUsers] = useState<User[]>(() => {
    // Try to load users from localStorage first
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : MOCK_USER_LIST;
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>([]);
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Save users to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);
  
  // Only superadmins can access this component
  if (user?.role !== "superadmin") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Role Management
          </CardTitle>
          <CardDescription>
            Only Super Admins can manage user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-2">You don't have permission to manage user roles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleEditRole = (userId: string) => {
    setEditingUserId(userId);
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setSelectedRole(userToEdit.role);
      setSelectedSecondaryRoles(userToEdit.secondaryRoles || []);
    }
  };
  
  const handleSaveRole = (userId: string) => {
    // Validate selection for Super Admin
    if (selectedRole === "superadmin" && selectedSecondaryRoles.length === 0) {
      toast.error("Super Admin requires at least one secondary role", {
        description: "Please select at least one additional role"
      });
      return;
    }
    
    // Regular users cannot have secondary roles
    const updatedSecondaryRoles = selectedRole === "superadmin" ? selectedSecondaryRoles : undefined;
    
    setUsers(users.map(u => 
      u.id === userId ? { 
        ...u, 
        role: selectedRole,
        secondaryRoles: updatedSecondaryRoles
      } : u
    ));
    setEditingUserId(null);
    
    toast.success("User role updated successfully", {
      description: `Role changed to ${ROLE_DETAILS[selectedRole].title}`
    });
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedSecondaryRoles([]);
  };

  const toggleSecondaryRole = (role: UserRole) => {
    setSelectedSecondaryRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };
  
  const handleEditPermissions = (user: User) => {
    setSelectedUser(user);
    setActiveTab("permissions");
  };
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const result = await deleteUser(userToDelete.id);
      
      if (result) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteClick = (user: User) => {
    if (user.id === user?.id) {
      toast.error("Cannot delete your own account", {
        description: "You cannot delete your own user account"
      });
      return;
    }
    
    setUserToDelete(user);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User & Permission Management
        </CardTitle>
        <CardDescription>
          Manage user roles and specific permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <Sliders className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarUpload user={user} size="sm" editable={false} />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUserId === user.id ? (
                        <div className="space-y-4">
                          <select 
                            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          >
                            {Object.entries(ROLE_DETAILS).map(([role, details]) => (
                              <option key={role} value={role}>{details.title}</option>
                            ))}
                          </select>
                          
                          {selectedRole === "superadmin" && (
                            <div className="p-3 border rounded-md space-y-3">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="text-xs text-muted-foreground">
                                  Super Admin requires at least one secondary role
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(ROLE_DETAILS)
                                  .filter(([role]) => role !== "superadmin") // Exclude superadmin from secondary roles
                                  .map(([role, details]) => (
                                    <div key={role} className="flex items-center space-x-2">
                                      <Checkbox 
                                        id={`role-${role}`} 
                                        checked={selectedSecondaryRoles.includes(role as UserRole)}
                                        onCheckedChange={() => toggleSecondaryRole(role as UserRole)}
                                      />
                                      <label htmlFor={`role-${role}`} className="text-sm">
                                        {details.title}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Badge variant="outline">{ROLE_DETAILS[user.role].title}</Badge>
                          
                          {user.secondaryRoles && user.secondaryRoles.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {user.secondaryRoles.map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  +{ROLE_DETAILS[role].title}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {user.customPermissions && (
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                Custom Permissions
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingUserId === user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => handleSaveRole(user.id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditPermissions(user)}
                          >
                            Permissions
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditRole(user.id)}
                          >
                            Change Role
                          </Button>
                          {user.id !== user?.id && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="permissions" className="mt-4">
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Permissions for {selectedUser.name}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab("roles")}
                  >
                    Back to Users
                  </Button>
                </div>
                <PermissionManagement selectedUser={selectedUser} />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Select a user from the Role Management tab to edit their permissions
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* User Deletion Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user account will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>
          
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-4">
                <AvatarUpload user={userToDelete} editable={false} />
                <div>
                  <h3 className="font-medium">{userToDelete.name}</h3>
                  <p className="text-sm text-muted-foreground">{userToDelete.email}</p>
                  <Badge variant="outline" className="mt-1">{ROLE_DETAILS[userToDelete.role].title}</Badge>
                </div>
              </div>
              
              <p className="text-sm text-destructive font-medium">
                Are you sure you want to delete this user?
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RoleManagement;
