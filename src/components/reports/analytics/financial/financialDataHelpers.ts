
// Helper functions for processing financial data

/**
 * Filters and formats chart data based on the selected property
 */
export const getFilteredChartData = (financialData: any[] = [], selectedProperty: string = 'all') => {
  // If there's no data, return empty array
  if (!financialData || financialData.length === 0) {
    return [];
  }
  
  // Filter data if a specific property is selected
  const filteredData = selectedProperty === 'all'
    ? financialData
    : financialData.filter(item => item.property === selectedProperty);
  
  // Group by month
  const groupedByMonth = filteredData.reduce((acc: any, curr: any) => {
    if (!acc[curr.month]) {
      acc[curr.month] = {
        month: curr.month,
        revenue: 0,
        expenses: 0,
        profit: 0
      };
    }
    
    acc[curr.month].revenue += curr.revenue;
    acc[curr.month].expenses += curr.expenses;
    acc[curr.month].profit += curr.profit;
    
    return acc;
  }, {});
  
  // Convert to array and sort by month
  return Object.values(groupedByMonth).sort((a: any, b: any) => {
    const [aYear, aMonth] = a.month.split('-').map(Number);
    const [bYear, bMonth] = b.month.split('-').map(Number);
    
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
};

/**
 * Gets profitability data for each property
 */
export const getProfitabilityByPropertyData = (financialData: any[] = []) => {
  // If there's no data, return empty array
  if (!financialData || financialData.length === 0) {
    return [];
  }
  
  // Group by property
  const groupedByProperty = financialData.reduce((acc: any, curr: any) => {
    if (!acc[curr.property]) {
      acc[curr.property] = {
        name: curr.property,
        revenue: 0,
        expenses: 0,
        profit: 0
      };
    }
    
    acc[curr.property].revenue += curr.revenue;
    acc[curr.property].expenses += curr.expenses;
    acc[curr.property].profit += curr.profit;
    
    return acc;
  }, {});
  
  // Convert to array and sort by profit
  return Object.values(groupedByProperty).sort((a: any, b: any) => b.profit - a.profit);
};

/**
 * Gets expense categories data
 */
export const getExpenseCategories = (financialData: any[] = [], selectedProperty: string = 'all') => {
  // If there's no data, return empty array
  if (!financialData || financialData.length === 0) {
    return [];
  }
  
  // Filter by property if needed
  const filteredData = selectedProperty === 'all'
    ? financialData
    : financialData.filter(item => item.property === selectedProperty);
  
  // Create categories
  const categoryTotals = filteredData.reduce((acc: any, curr: any) => {
    const category = curr.category || 'Uncategorized';
    
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: 0
      };
    }
    
    acc[category].value += curr.expenses;
    
    return acc;
  }, {});
  
  // Convert to array and sort by value
  return Object.values(categoryTotals)
    .filter((cat: any) => cat.value > 0)
    .sort((a: any, b: any) => b.value - a.value);
};
