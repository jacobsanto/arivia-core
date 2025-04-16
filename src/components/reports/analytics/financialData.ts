
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

// Helper function to format data for charts
export const formatFinancialReportData = (data: any[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};
