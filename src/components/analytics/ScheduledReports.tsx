
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toastService } from "@/services/toast/toast.service";
import { useReports } from "@/hooks/useReports";
import { ReportFormDialog } from "./reports/ReportFormDialog";
import { ReportTable } from "./reports/ReportTable";
import { ReportStatistics } from "./reports/ReportStatistics";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  recipients: string;
  lastSent: string;
  nextScheduled: string;
}

const scheduledReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Monthly Revenue Summary",
    frequency: "Monthly",
    recipients: "management@example.com",
    lastSent: "2025-03-01",
    nextScheduled: "2025-04-01",
  },
  {
    id: "2",
    name: "Weekly Occupancy Report",
    frequency: "Weekly",
    recipients: "operations@example.com",
    lastSent: "2025-03-29",
    nextScheduled: "2025-04-05",
  },
  {
    id: "3",
    name: "Staff Performance Review",
    frequency: "Monthly",
    recipients: "hr@example.com",
    lastSent: "2025-03-15",
    nextScheduled: "2025-04-15",
  },
];

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
  const { reports, loadReports, sendReportNow } = useReports('task');
  
  useEffect(() => {
    loadReports();
  }, []);

  const handleDeleteReport = (id: string) => {
    // In a real app this would make an API call
    toastService.info("Report deleted successfully");
  };

  const handleSendNow = async (report: ScheduledReport) => {
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
      
      // Show a success message
      toastService.success(`Report sent successfully`, {
        description: `${report.name} has been sent to ${report.recipients}.`
      });
    } catch (error) {
      toastService.error(`Failed to send report`, {
        description: `There was an error sending ${report.name}. Please try again.`
      });
    } finally {
      setSendingReportId(null);
    }
  };

  const handleEditReport = (report: ScheduledReport) => {
    setIsEditMode(true);
    setEditReportId(report.id);
    setReportName(report.name);
    setReportFrequency(report.frequency);
    setReportRecipients(report.recipients);
    setIsDialogOpen(true);
  };

  const handleSaveReport = () => {
    // In a real app this would make an API call
    if (isEditMode && editReportId) {
      toastService.success("Report updated successfully");
    } else {
      toastService.success("New scheduled report created");
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
        reports={scheduledReports}
        sendingReportId={sendingReportId}
        onSendNow={handleSendNow}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
      />
      
      <ReportStatistics activeReportsCount={scheduledReports.length} />
      
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
