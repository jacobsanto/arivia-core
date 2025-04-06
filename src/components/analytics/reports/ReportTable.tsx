
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Send, AlertTriangle, Loader2 } from "lucide-react";

interface Report {
  id: string;
  name: string;
  frequency: string;
  recipients: string;
  lastSent: string;
  nextScheduled: string;
}

interface ReportTableProps {
  reports: Report[];
  sendingReportId: string | null;
  onSendNow: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  sendingReportId,
  onSendNow,
  onEdit,
  onDelete,
}) => {
  return (
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
          {reports.length > 0 ? (
            reports.map((report) => (
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
                    onClick={() => onSendNow(report)}
                    disabled={sendingReportId === report.id}
                  >
                    {sendingReportId === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => onEdit(report)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => onDelete(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  <p>No scheduled reports found</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => {}}>
                    Create your first report
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
