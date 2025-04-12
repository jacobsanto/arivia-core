
import React from 'react';
import { ExportDropdown } from './buttons/ExportDropdown';
import { PrintButton } from './buttons/PrintButton';
import { SaveButton } from './buttons/SaveButton';
import { ShareButton } from './buttons/ShareButton';
import { getReportTitle, getFilename } from './utils/reportTitleUtils';

interface ReportActionButtonsProps {
  activeTab: string;
  dateRange: string;
  data: any[];
}

export const ReportActionButtons: React.FC<ReportActionButtonsProps> = ({
  activeTab,
  dateRange,
  data
}) => {
  const reportTitle = getReportTitle(activeTab);
  const filename = getFilename(activeTab, dateRange);
  
  return (
    <div className="flex space-x-2">
      <ExportDropdown 
        data={data} 
        filename={filename} 
        reportTitle={reportTitle} 
      />
      
      <PrintButton 
        data={data} 
        reportTitle={reportTitle} 
      />
      
      <SaveButton 
        reportTitle={reportTitle} 
      />
      
      <ShareButton 
        reportTitle={reportTitle} 
      />
    </div>
  );
};
