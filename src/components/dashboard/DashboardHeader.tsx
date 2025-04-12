
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PropertyFilter from "@/components/dashboard/PropertyFilter";
import { DateRangeSelector, type DateRange } from "@/components/reports/DateRangeSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { Bell, FileDown, RefreshCw, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

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
  const { user } = useUser();
  const isSuperAdmin = user?.role === "superadmin";
  
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');

  const handleGenerateReports = () => {
    toast({
      title: "Reports Generated",
      description: "Monthly reports have been emailed to your inbox."
    });
  };

  const handleRefreshData = () => {
    toast({
      title: "Dashboard Refreshed",
      description: "Latest data has been fetched from all sources."
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          
          {isSuperAdmin && !isMobile && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleGenerateReports}
              >
                <FileDown className="h-4 w-4" />
                <span>Export Reports</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleRefreshData}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              
              <Button size="sm" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span>Weekly Review</span>
              </Button>
            </div>
          )}
        </div>
        
        {!isMobile && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 mr-2">
              {selectedProperty === "all" ? "All Properties" : selectedProperty}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              {format(dateRange.from || new Date(), 'MMM d')} - {format(dateRange.to || new Date(), 'MMM d')}
            </Badge>
          </div>
        )}
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
        
        {isMobile && isSuperAdmin && (
          <Button 
            variant="outline" 
            onClick={handleGenerateReports}
            className="w-full flex items-center justify-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Export Reports</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
