
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetricsChart } from '@/components/analytics/PerformanceMetricsChart';
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfitabilityComparisonProps {
  propertyComparisonData: any[];
}

export const ProfitabilityComparison: React.FC<ProfitabilityComparisonProps> = ({ 
  propertyComparisonData 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profitability by Property</CardTitle>
        <CardDescription>Revenue and expenses comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <PerformanceMetricsChart 
          title="Profitability by Property"
          data={propertyComparisonData}
          height={300}
          hideLegend={isMobile}
          type="bar"
          dataKeys={[
            { key: 'revenue', name: 'Revenue', color: '#4CAF50' },
            { key: 'expenses', name: 'Expenses', color: '#F44336' },
            { key: 'profit', name: 'Profit', color: '#2196F3' }
          ]}
        />
      </CardContent>
    </Card>
  );
};
