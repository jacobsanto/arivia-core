
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
        <span className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        </span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshClick}
        disabled={isRefreshing || disabled}
      >
        <span className="flex items-center">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onWeeklyReviewClick}
        disabled={disabled}
      >
        <span className="flex items-center">
          <BarChart4 className="h-4 w-4 mr-2" />
          <span>Weekly Review</span>
        </span>
      </Button>
    </div>
  );
};

export default ActionButtons;
