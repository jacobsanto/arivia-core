
export const usePermissions = () => {
  const allPermissions = [
    { key: "viewProperties", label: "View Properties" },
    { key: "manageProperties", label: "Manage Properties" },
    { key: "viewUsers", label: "View Users" },
    { key: "manageUsers", label: "Manage Users" },
    { key: "assignTasks", label: "Assign Tasks" },
    { key: "viewAllTasks", label: "View All Tasks" },
    { key: "viewAssignedTasks", label: "View Assigned Tasks" },
    { key: "viewInventory", label: "View Inventory" },
    { key: "manageInventory", label: "Manage Inventory" },
    { key: "approveTransfers", label: "Approve Transfers" },
    { key: "viewReports", label: "View Reports" },
    { key: "manageSettings", label: "Manage Settings" },
  ];

  // Role-based permission mapping
  const rolePermissions: Record<string, string[]> = {
    'superadmin': allPermissions.map(p => p.key),
    'tenant_admin': [
      'viewProperties', 'manageProperties', 'viewUsers', 'manageUsers',
      'assignTasks', 'viewAllTasks', 'viewInventory', 'manageInventory',
      'viewReports', 'manageSettings'
    ],
    'property_manager': [
      'viewProperties', 'assignTasks', 'viewAllTasks', 'viewInventory',
      'viewReports'
    ],
    'housekeeping_staff': [
      'viewProperties', 'viewAssignedTasks', 'viewInventory'
    ],
    'maintenance_staff': [
      'viewProperties', 'viewAssignedTasks', 'viewInventory'
    ],
    'inventory_manager': [
      'viewInventory', 'manageInventory', 'approveTransfers', 'viewReports'
    ],
    'concierge': [
      'viewProperties', 'viewAssignedTasks'
    ]
  };

  const canAccess = (permission: string, userRole?: string | null) => {
    if (!userRole) return false;
    return rolePermissions[userRole]?.includes(permission) ?? false;
  };

  return { allPermissions, canAccess, rolePermissions };
};
