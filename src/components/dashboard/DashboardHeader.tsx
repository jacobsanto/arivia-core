
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";

interface DashboardHeaderProps {
  selectedProperty: string;
  onPropertyChange: (property: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  selectedProperty,
  onPropertyChange,
  date,
  onDateChange
}) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to the Arivia Villas management system.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <PropertyFilter 
            selectedProperty={selectedProperty}
            onPropertyChange={onPropertyChange}
          />
          <DateRangeFilter
            date={date}
            onDateChange={onDateChange}
          />
        </div>
        <Button variant="outline" onClick={() => {
          toast({
            title: "Reports Generated",
            description: "Monthly reports have been emailed to your inbox.",
          });
        }}>
          Generate Reports
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
