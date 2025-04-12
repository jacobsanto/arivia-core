
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReports } from '@/hooks/useReports';
import { toastService } from '@/services/toast/toast.service';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface AnalyticsToReportDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  data: any[];
  chartType: string;
}

export const AnalyticsToReportDialog: React.FC<AnalyticsToReportDialogProps> = ({
  isOpen,
  setIsOpen,
  title,
  data,
  chartType
}) => {
  const [reportName, setReportName] = useState(title);
  const [reportDescription, setReportDescription] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [isSaving, setIsSaving] = useState(false);
  
  const { createReport } = useReports('custom');
  const { selectedProperty, dateRange } = useAnalytics();
  
  const handleCreateReport = async () => {
    if (!reportName.trim()) {
      toastService.error('Please provide a report name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await createReport({
        name: reportName,
        type: 'custom',
        filters: {
          property: selectedProperty,
          chartType: chartType,
          description: reportDescription,
          frequency: frequency,
          data: data
        },
        dateRange: {
          startDate: dateRange.from?.toISOString() || null,
          endDate: dateRange.to?.toISOString() || null
        }
      });
      
      toastService.success('Report created', {
        description: 'Your analytics report has been created successfully'
      });
      
      setIsOpen(false);
    } catch (error) {
      toastService.error('Failed to create report');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Report from Analytics</DialogTitle>
          <DialogDescription>
            Create a new report based on the selected analytics.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Enter report description (optional)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Selected Property</Label>
            <div className="border rounded-md p-2 bg-muted/50">
              {selectedProperty === 'all' ? 'All Properties' : selectedProperty}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreateReport} disabled={isSaving || !reportName.trim()}>
            {isSaving ? 'Creating...' : 'Create Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
