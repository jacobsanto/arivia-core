import React from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardContentProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>
            System overview and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Dashboard content will be implemented here.</p>
          {dateRange && (
            <p className="text-sm text-muted-foreground mt-2">
              Date range: {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;
