
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import { DateRangeSelector, type DateRange } from "@/components/reports/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          <PropertyFilter
            selectedProperty={selectedProperty}
            onPropertyChange={onPropertyChange}
          />
          {!isMobile && (
            <DateRangeSelector 
              value={dateRange} 
              onChange={onDateRangeChange} 
            />
          )}
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => {
            toast({
              title: "Reports Generated",
              description: "Monthly reports have been emailed to your inbox."
            });
          }}
          className={isMobile ? "w-full sm:w-auto" : ""}
        >
          Generate Reports
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
