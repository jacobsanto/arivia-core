
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { toastService } from "@/services/toast/toast.service";

interface ReportFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isEditMode: boolean;
  reportName: string;
  setReportName: (name: string) => void;
  reportFrequency: string;
  setReportFrequency: (frequency: string) => void;
  reportRecipients: string;
  setReportRecipients: (recipients: string) => void;
  dateRange: {from: Date | undefined, to: Date | undefined};
  setDateRange: (range: {from: Date | undefined, to: Date | undefined}) => void;
  onSave: () => void;
}

export const ReportFormDialog: React.FC<ReportFormDialogProps> = ({
  isOpen,
  setIsOpen,
  isEditMode,
  reportName,
  setReportName,
  reportFrequency,
  setReportFrequency,
  reportRecipients,
  setReportRecipients,
  dateRange,
  setDateRange,
  onSave,
}) => {
  
  const handleSave = () => {
    // Validation
    if (!reportName.trim()) {
      toastService.error("Report name is required");
      return;
    }
    
    if (!reportRecipients.trim()) {
      toastService.error("Recipients are required");
      return;
    }
    
    onSave();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Scheduled Report" : "Create Scheduled Report"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Name</label>
            <input
              className="w-full border rounded-md p-2"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Monthly Revenue Summary"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <select
              className="w-full border rounded-md p-2"
              value={reportFrequency}
              onChange={(e) => setReportFrequency(e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <DateRangeSelector 
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients (comma separated)</label>
            <input
              className="w-full border rounded-md p-2"
              value={reportRecipients}
              onChange={(e) => setReportRecipients(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
