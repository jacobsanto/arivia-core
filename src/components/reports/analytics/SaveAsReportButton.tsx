
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PropertyFilter, useAnalytics } from '@/contexts/AnalyticsContext';
import { toastService } from '@/services/toast/toast.service';
import { useReports } from '@/hooks/useReports';

interface SaveAsReportButtonProps {
  chartTitle: string;
  dataType: 'financial' | 'occupancy' | 'performance' | 'task' | 'activity';
  data: any[];
}

export const SaveAsReportButton: React.FC<SaveAsReportButtonProps> = ({
  chartTitle,
  dataType,
  data
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportName, setReportName] = useState(chartTitle);
  const [reportDescription, setReportDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const { selectedProperty, dateRange } = useAnalytics();
  const { createReport } = useReports(dataType === 'task' ? 'task' : 'custom');
  
  const handleOpenDialog = () => {
    setReportName(chartTitle);
    setReportDescription(`${chartTitle} ${selectedProperty !== 'all' ? `for ${selectedProperty}` : 'across all properties'}`);
    setIsDialogOpen(true);
  };
  
  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      toastService.error('Please enter a report name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create the report with the analytics data
      await createReport({
        name: reportName,
        type: dataType === 'task' ? 'task' : 'custom',
        filters: {
          property: selectedProperty,
          chartType: dataType
        },
        dateRange: {
          startDate: dateRange.from?.toISOString() || null,
          endDate: dateRange.to?.toISOString() || null,
        }
      });
      
      toastService.success('Report saved successfully', {
        description: 'You can access this report from the Reports tab.'
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toastService.error('Failed to save report', {
        description: 'Please try again later.'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-1" 
        onClick={handleOpenDialog}
      >
        <Save className="h-4 w-4" />
        <span>Save as Report</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Report</DialogTitle>
            <DialogDescription>
              Create a new report from this analytics chart.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Input
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveReport}
              disabled={isSaving || !reportName.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
