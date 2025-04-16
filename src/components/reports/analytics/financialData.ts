
import { FinancialReport } from "@/services/analytics/analytics.service";

// Format financial data for report visualization
export const formatFinancialReportData = (data: FinancialReport[], property: string) => {
  if (property === "all") {
    return data;
  }
  return data.filter(item => item.property === property);
};

// Transform financial data for monthly revenue display
export const getMonthlyRevenueData = (data: FinancialReport[]) => {
  return data.map(item => ({
    name: item.month,
    revenue: item.revenue,
    expenses: item.expenses,
    profit: item.profit
  }));
};

// Group financial data by property
export const getRevenueByPropertyData = (data: FinancialReport[]) => {
  const propertyMap: Record<string, { revenue: number, expenses: number, profit: number }> = {};
  
  data.forEach(item => {
    if (!propertyMap[item.property]) {
      propertyMap[item.property] = { revenue: 0, expenses: 0, profit: 0 };
    }
    
    propertyMap[item.property].revenue += item.revenue;
    propertyMap[item.property].expenses += item.expenses;
    propertyMap[item.property].profit += item.profit;
  });
  
  return Object.entries(propertyMap).map(([property, values]) => ({
    name: property,
    revenue: values.revenue,
    expenses: values.expenses,
    profit: values.profit
  }));
};

// Analyze expense categories
export const getExpenseAnalysisData = (data: FinancialReport[]) => {
  const categories: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.category === 'revenue') return;
    
    if (!categories[item.category]) {
      categories[item.category] = 0;
    }
    
    categories[item.category] += item.expenses;
  });
  
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value
  }));
};
