
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, BarChart4 } from "lucide-react";

interface ActionButtonsProps {
  isExporting: boolean;
  isRefreshing: boolean;
  onExportClick: () => void;
  onRefreshClick: () => void;
  onWeeklyReviewClick: () => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isExporting,
  isRefreshing,
  onExportClick,
  onRefreshClick,
  onWeeklyReviewClick,
  disabled = false
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExportClick}
        disabled={isExporting || disabled}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshClick}
        disabled={isRefreshing || disabled}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onWeeklyReviewClick}
        disabled={disabled}
      >
        <BarChart4 className="h-4 w-4 mr-2" />
        Weekly Review
      </Button>
    </div>
  );
};

export default ActionButtons;
