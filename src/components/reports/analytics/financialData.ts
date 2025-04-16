
// This file will be replaced by real data from the database

export const financialData = [];
export const revenueByPropertyData = [];
export const expenseAnalysisData = [];

// Helper function for chart data formatting
export const formatFinancialReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};

