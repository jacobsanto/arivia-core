
// Helper functions for financial data transformation

/**
 * Filter data based on selected property and transform for charts
 */
export const getFilteredChartData = (financialData: any[], selectedProperty: string) => {
  let filteredData = financialData;
  
  if (selectedProperty !== 'all') {
    filteredData = filteredData.filter(item => item.property === selectedProperty);
  }
  
  // Transform for the chart
  return filteredData.map(item => ({
    name: item.month,
    revenue: item.revenue,
    expenses: item.expenses,
    profit: item.profit
  }));
};

/**
 * Group data by property for comparison
 */
export const getProfitabilityByPropertyData = (financialData: any[]) => {
  const propertyData: Record<string, { revenue: number, expenses: number, profit: number }> = {};
  
  financialData.forEach(item => {
    if (!propertyData[item.property]) {
      propertyData[item.property] = { revenue: 0, expenses: 0, profit: 0 };
    }
    
    propertyData[item.property].revenue += item.revenue;
    propertyData[item.property].expenses += item.expenses;
    propertyData[item.property].profit += item.profit;
  });
  
  return Object.entries(propertyData).map(([property, data]) => ({
    name: property,
    ...data
  }));
};

/**
 * Calculate expense categories
 */
export const getExpenseCategories = (financialData: any[], selectedProperty: string) => {
  const categories: Record<string, number> = {};
  let totalExpenses = 0;
  
  // Filter by property if needed
  const relevantData = selectedProperty === 'all' 
    ? financialData 
    : financialData.filter(item => item.property === selectedProperty);
  
  // Group expenses by category
  relevantData.forEach(item => {
    if (!item.category || item.category === 'revenue') return;
    
    if (!categories[item.category]) {
      categories[item.category] = 0;
    }
    
    categories[item.category] += item.expenses;
    totalExpenses += item.expenses;
  });
  
  // Convert to percentage
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0
  }));
};
