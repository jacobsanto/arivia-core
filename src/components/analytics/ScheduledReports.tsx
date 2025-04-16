
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toastService } from "@/services/toast/toast.service";
import { useReports } from "@/hooks/useReports";
import { ReportFormDialog } from "./reports/ReportFormDialog";
import { ReportTable } from "./reports/ReportTable";
import { ReportStatistics } from "./reports/ReportStatistics";
import { supabase } from "@/integrations/supabase/client";

export const ScheduledReports = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [reportFrequency, setReportFrequency] = useState("Weekly");
  const [reportRecipients, setReportRecipients] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editReportId, setEditReportId] = useState<string | null>(null);
  const [sendingReportId, setSendingReportId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined
  });
  
  // Use our reports hook
  const { reports, loadReports, sendReportNow, isAuthenticated } = useReports('custom');
  
  // Transform reports to match the component's expected format
  const formattedReports = reports.map(report => ({
    id: report.id,
    name: report.name,
    frequency: report.frequency || 'Monthly',
    recipients: Array.isArray(report.recipients) ? report.recipients.join(', ') : 'No recipients',
    lastSent: report.last_run ? new Date(report.last_run).toLocaleDateString() : 'Never',
    nextScheduled: report.next_scheduled ? new Date(report.next_scheduled).toLocaleDateString() : 'Not scheduled'
  }));
  
  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
    }
  }, [isAuthenticated]);

  const handleDeleteReport = async (id: string) => {
    try {
      // Call Supabase to delete the report
      const { error } = await supabase
        .from('reports')
        .update({ status: 'archived' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh reports list
      await loadReports();
      toastService.success("Report deleted successfully");
    } catch (error: any) {
      toastService.error("Error deleting report", {
        description: error.message || "An unknown error occurred"
      });
    }
  };

  const handleSendNow = async (report: any) => {
    try {
      setSendingReportId(report.id);
      
      // Show a "preparing" message
      toastService.info(`Preparing ${report.name}...`, {
        description: `Gathering data for report delivery.`
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the send report function
      await sendReportNow(report.id);
      
    } catch (error) {
      toastService.error(`Failed to send report`, {
        description: `There was an error sending ${report.name}. Please try again.`
      });
    } finally {
      setSendingReportId(null);
    }
  };

  const handleEditReport = (report: any) => {
    setIsEditMode(true);
    setEditReportId(report.id);
    setReportName(report.name);
    setReportFrequency(report.frequency);
    setReportRecipients(Array.isArray(report.recipients) ? report.recipients.join(', ') : '');
    setIsDialogOpen(true);
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      toastService.error("Report name is required");
      return;
    }
    
    try {
      const recipientsList = reportRecipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email);
      
      if (isEditMode && editReportId) {
        // Update existing report
        const { error } = await supabase
          .from('reports')
          .update({
            name: reportName,
            frequency: reportFrequency,
            recipients: recipientsList
          })
          .eq('id', editReportId);
        
        if (error) throw error;
        
        toastService.success("Report updated successfully");
      } else {
        // Creating a new report
        const { error } = await supabase
          .from('reports')
          .insert({
            name: reportName,
            type: 'custom',
            frequency: reportFrequency,
            recipients: recipientsList,
            date_range: {
              start_date: dateRange.from?.toISOString() || null,
              end_date: dateRange.to?.toISOString() || null
            }
          });
        
        if (error) throw error;
        
        toastService.success("New scheduled report created");
      }
      
      // Refresh reports list
      await loadReports();
    } catch (error: any) {
      toastService.error("Error saving report", {
        description: error.message || "An unknown error occurred"
      });
    }
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setReportName("");
    setReportFrequency("Weekly");
    setReportRecipients("");
    setIsEditMode(false);
    setEditReportId(null);
  };

  const handleOpenNewReportDialog = () => {
    setIsEditMode(false);
    setReportName("");
    setReportFrequency("Weekly");
    setReportRecipients("");
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Scheduled Reports</h2>
        <Button onClick={handleOpenNewReportDialog}>
          New Scheduled Report
        </Button>
      </div>
      
      <ReportTable 
        reports={formattedReports}
        sendingReportId={sendingReportId}
        onSendNow={handleSendNow}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
      />
      
      <ReportStatistics activeReportsCount={formattedReports.length} />
      
      <ReportFormDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        isEditMode={isEditMode}
        reportName={reportName}
        setReportName={setReportName}
        reportFrequency={reportFrequency}
        setReportFrequency={setReportFrequency}
        reportRecipients={reportRecipients}
        setReportRecipients={setReportRecipients}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default ScheduledReports;
