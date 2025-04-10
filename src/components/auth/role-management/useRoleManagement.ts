
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { User, UserRole } from "@/types/auth";
import { toast } from "sonner";

// Mock user list for demonstration
const MOCK_USER_LIST: User[] = [{
  id: "1",
  email: "admin@ariviavillas.com",
  name: "Admin User",
  role: "administrator"
}, {
  id: "2",
  email: "manager@ariviavillas.com",
  name: "Property Manager",
  role: "property_manager"
}, {
  id: "3",
  email: "concierge@ariviavillas.com",
  name: "Concierge Staff",
  role: "concierge"
}, {
  id: "4",
  email: "housekeeping@ariviavillas.com",
  name: "Housekeeping Staff",
  role: "housekeeping_staff"
}, {
  id: "5",
  email: "maintenance@ariviavillas.com",
  name: "Maintenance Staff",
  role: "maintenance_staff"
}, {
  id: "6",
  email: "inventory@ariviavillas.com",
  name: "Inventory Manager",
  role: "inventory_manager"
}, {
  id: "7",
  email: "superadmin@ariviavillas.com",
  name: "Super Admin",
  role: "superadmin",
  secondaryRoles: ["administrator"]
}];

export const useRoleManagement = () => {
  const { user, deleteUser } = useUser();
  
  const [users, setUsers] = useState<User[]>(() => {
    // Try to load users from localStorage first
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : MOCK_USER_LIST;
  });
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("administrator");
  const [selectedSecondaryRoles, setSelectedSecondaryRoles] = useState<UserRole[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);

  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

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
    setUsers(users.map(u => u.id === userId ? {
      ...u,
      role: selectedRole,
      secondaryRoles: updatedSecondaryRoles
    } : u));
    setEditingUserId(null);
    toast.success("User role updated successfully", {
      description: `Role updated successfully`
    });
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setSelectedSecondaryRoles([]);
  };
  
  const toggleSecondaryRole = (role: UserRole) => {
    setSelectedSecondaryRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };
  
  const handleEditPermissions = (user: User) => {
    return user;
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
  
  const toggleExpandUser = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return {
    users,
    editingUserId,
    selectedRole,
    selectedSecondaryRoles,
    userToDelete,
    isDeleting,
    expandedUsers,
    setUserToDelete,
    handleEditRole,
    handleSaveRole,
    handleCancelEdit,
    toggleSecondaryRole,
    handleEditPermissions,
    handleDeleteConfirm,
    toggleExpandUser
  };
};
