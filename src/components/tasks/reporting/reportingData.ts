
// Placeholder for reporting data until we fully integrate with the database

export const propertyReports = [
  {
    property: "Villa Caldera",
    completedTasks: 42,
    pendingTasks: 8,
    overdueTasks: 2
  },
  {
    property: "Villa Oceana",
    completedTasks: 36,
    pendingTasks: 12,
    overdueTasks: 5
  }
];

// Chart colors for consistent styling
export const barColors = {
  completed: "#10b981",
  pending: "#f59e0b",
  overdue: "#ef4444",
  rejected: "#f43f5e",  // Added color for rejected tasks
  approved: "#22c55e"   // Added color for approved tasks
};
