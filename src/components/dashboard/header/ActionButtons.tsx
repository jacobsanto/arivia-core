
import React from 'react';
import ExportButton from './ExportButton';
import RefreshButton from './RefreshButton';
import WeeklyReviewButton from './WeeklyReviewButton';

interface ActionButtonsProps {
  isExporting: boolean;
  isRefreshing: boolean;
  onExportClick: () => void;
  onRefreshClick: () => void;
  onWeeklyReviewClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isExporting,
  isRefreshing,
  onExportClick,
  onRefreshClick,
  onWeeklyReviewClick
}) => {
  return (
    <div className="flex items-center gap-2">
      <ExportButton isExporting={isExporting} onClick={onExportClick} />
      <RefreshButton isRefreshing={isRefreshing} onClick={onRefreshClick} />
      <WeeklyReviewButton onClick={onWeeklyReviewClick} />
    </div>
  );
};

export default ActionButtons;
