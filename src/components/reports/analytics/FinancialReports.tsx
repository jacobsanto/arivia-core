
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { FinancialMetricsCards } from './financial/FinancialMetricsCards';
import { FinancialOverviewChart } from './financial/FinancialOverviewChart';
import { ProfitabilityComparison } from './financial/ProfitabilityComparison';
import { ExpenseCategories } from './financial/ExpenseCategories';
import { 
  getFilteredChartData, 
  getProfitabilityByPropertyData, 
  getExpenseCategories 
} from './financial/financialDataHelpers';

export const FinancialReports: React.FC = () => {
  const { selectedProperty, selectedYear, financialData, isLoading } = useAnalytics();
  
  // Get the financial overview title based on filters
  const getFinancialOverviewTitle = () => {
    return selectedProperty === 'all' 
      ? "Annual Financial Overview" 
      : `${selectedProperty} Financial Overview`;
  };

  // Get the financial overview description
  const getFinancialOverviewDescription = () => {
    return selectedProperty === 'all'
      ? `Combined monthly revenue, expenses and profit for ${selectedYear}`
      : `Monthly revenue, expenses and profit for ${selectedProperty} in ${selectedYear}`;
  };
  
  const chartData = getFilteredChartData(financialData, selectedProperty);
  const propertyComparisonData = getProfitabilityByPropertyData(financialData);
  const expenseCategoriesData = getExpenseCategories(financialData, selectedProperty);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <FinancialOverviewChart 
        title={getFinancialOverviewTitle()} 
        description={getFinancialOverviewDescription()} 
        chartData={chartData} 
      />
      
      <FinancialMetricsCards financialData={financialData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedProperty === 'all' && (
          <ProfitabilityComparison propertyComparisonData={propertyComparisonData} />
        )}
        
        <ExpenseCategories 
          expenseCategoriesData={expenseCategoriesData} 
          propertyName={selectedProperty} 
        />
      </div>
    </div>
  );
};
