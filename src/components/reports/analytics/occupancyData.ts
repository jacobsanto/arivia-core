
// This file will be replaced by real data from the database

export const occupancyData = [];
export const monthlyOccupancyData = [];

// Helper function for chart data formatting
export const formatOccupancyReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};

