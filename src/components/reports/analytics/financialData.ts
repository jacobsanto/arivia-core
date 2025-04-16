
// Placeholder for financial data until we fully integrate with the database

export const financialData = [
  { 
    month: "January", 
    property: "Villa Caldera", 
    revenue: 15000, 
    expenses: 6000, 
    profit: 9000,
    margin: "60%"
  },
  { 
    month: "February", 
    property: "Villa Caldera", 
    revenue: 12000, 
    expenses: 5500, 
    profit: 6500,
    margin: "54%"
  }
];

// Mock data for revenue by property
export const revenueByPropertyData = [
  { property: "Villa Caldera", revenue: 75000 },
  { property: "Villa Sunset", revenue: 62000 },
  { property: "Villa Oceana", revenue: 88000 },
  { property: "Villa Paradiso", revenue: 53000 },
  { property: "Villa Azure", revenue: 67000 }
];

// Mock data for expense analysis
export const expenseAnalysisData = [
  { category: "Cleaning", amount: 12000 },
  { category: "Maintenance", amount: 8500 },
  { category: "Utilities", amount: 15000 },
  { category: "Management", amount: 20000 },
  { category: "Other", amount: 5500 }
];

// Helper function to format data for charts
export const formatFinancialReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};
