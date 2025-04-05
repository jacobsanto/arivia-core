
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Clock } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Scheduled Reports</h2>
        <Button>
          <Clock className="mr-2 h-4 w-4" />
          New Scheduled Report
        </Button>
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
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ScheduledReports;
