
import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Clock, Send, AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toastService } from "@/services/toast/toast.service";
import { useReports } from "@/hooks/useReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";

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
  
  // Use our new reports hook
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
    // Validation
    if (!reportName.trim()) {
      toastService.error("Report name is required");
      return;
    }
    
    if (!reportRecipients.trim()) {
      toastService.error("Recipients are required");
      return;
    }
    
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Scheduled Reports</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              setReportName("");
              setReportFrequency("Weekly");
              setReportRecipients("");
            }}>
              <Clock className="mr-2 h-4 w-4" />
              New Scheduled Report
            </Button>
          </DialogTrigger>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveReport}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Last Sent</TableHead>
              <TableHead>Next Scheduled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>{report.frequency}</TableCell>
                <TableCell>{report.recipients}</TableCell>
                <TableCell>{report.lastSent}</TableCell>
                <TableCell>{report.nextScheduled}</TableCell>
                <TableCell className="text-right flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Send Now" 
                    onClick={() => handleSendNow(report)}
                    disabled={sendingReportId === report.id}
                  >
                    {sendingReportId === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEditReport(report)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteReport(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {scheduledReports.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p>No scheduled reports found</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsDialogOpen(true)}>
                      Create your first report
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Report Delivery Statistics</CardTitle>
          <CardDescription>Summary of report deliveries in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-3xl font-bold">{scheduledReports.length}</div>
              <div className="text-sm text-muted-foreground">Active Reports</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">Reports Sent</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">Delivery Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledReports;
