import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import { DateRangeSelector, type DateRange } from "@/components/reports/DateRangeSelector";
interface DashboardHeaderProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedProperty,
  onPropertyChange,
  dateRange,
  onDateRangeChange
}) => {
  const {
    toast
  } = useToast();
  return <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back </p>
      </div>
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <PropertyFilter selectedProperty={selectedProperty} onPropertyChange={onPropertyChange} />
          <DateRangeSelector value={dateRange} onChange={onDateRangeChange} className="w-full sm:w-auto" />
        </div>
        <Button variant="outline" onClick={() => {
        toast({
          title: "Reports Generated",
          description: "Monthly reports have been emailed to your inbox."
        });
      }}>
          Generate Reports
        </Button>
      </div>
    </div>;
};
export default DashboardHeader;