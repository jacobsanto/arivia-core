
import React from 'react';
import ExportButton from './ExportButton';
import RefreshButton from './RefreshButton';

interface MobileActionButtonsProps {
  isExporting: boolean;
  isRefreshing: boolean;
  onExportClick: () => void;
  onRefreshClick: () => void;
}

const MobileActionButtons: React.FC<MobileActionButtonsProps> = ({
  isExporting,
  isRefreshing,
  onExportClick,
  onRefreshClick
}) => {
  return (
    <div className="flex gap-2">
      <ExportButton 
        isExporting={isExporting} 
        onClick={onExportClick} 
        isMobile={true}
      />
      <RefreshButton 
        isRefreshing={isRefreshing} 
        onClick={onRefreshClick} 
        isMobile={true}
      />
    </div>
  );
};

export default MobileActionButtons;
