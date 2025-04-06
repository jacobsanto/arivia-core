
import React from 'react';
import { FileText, BarChart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toastService } from "@/services/toast/toast.service";

interface ReportsHeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onCreateReport: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({ 
  activeView, 
  setActiveView, 
  onCreateReport 
}) => {
  // Function to handle how users can get help with reports
  const handleHelpRequest = () => {
    toastService.info("Help Center", {
      description: "Our reporting documentation has been opened in a new tab."
    });
    // In a real app, this would open actual documentation
    window.open("https://example.com/help/reports", "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          {activeView === 'reporting' ? (
            <>
              <FileText className="mr-2 h-7 w-7" /> Reports
            </>
          ) : (
            <>
              <BarChart className="mr-2 h-7 w-7" /> Analytics
            </>
          )}
        </h1>
        <p className="text-muted-foreground">
          {activeView === 'reporting' ? 
            "View insights, generate reports, and analyze business data." :
            "View insights, track performance, and analyze business data."}
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setActiveView(activeView === 'reporting' ? 'analytics' : 'reporting')}
        >
          {activeView === 'reporting' ? (
            <>
              <BarChart className="mr-2 h-4 w-4" />
              Switch to Analytics
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Switch to Reports
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleHelpRequest}>
          Help & Documentation
        </Button>
        <Button onClick={onCreateReport}>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>
    </div>
  );
};
