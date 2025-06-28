
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
  return { allPermissions };
};
