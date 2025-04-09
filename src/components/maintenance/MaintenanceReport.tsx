
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MaintenanceReport as ReportType, MaintenanceTask } from "@/types/maintenanceTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface MaintenanceReportProps {
  task: MaintenanceTask;
  onClose: () => void;
  onSubmit: (report: ReportType) => void;
  report: ReportType;
}

const MaintenanceReport = ({
  task,
  onClose,
  onSubmit,
  report: initialReport,
}: MaintenanceReportProps) => {
  const [report, setReport] = useState<ReportType>(initialReport);
  const isMobile = useIsMobile();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(report);
  };

  const content = (
    <>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{task.title}</h2>
        <p className="text-sm text-muted-foreground">{task.property}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeSpent">Time Spent</Label>
            <Input
              id="timeSpent"
              name="timeSpent"
              placeholder="e.g. 1.5 hours"
              value={report.timeSpent}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost</Label>
            <Input
              id="cost"
              name="cost"
              placeholder="e.g. €25.00"
              value={report.cost}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="materialsUsed">Materials Used</Label>
          <Input
            id="materialsUsed"
            name="materialsUsed"
            placeholder="e.g. Pipe fittings, sealant"
            value={report.materialsUsed}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Additional notes or comments"
            className="min-h-[120px]"
            value={report.notes}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Report</Button>
        </div>
      </form>
    </>
  );

  // Use a Sheet component for mobile and Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] pt-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Maintenance Report</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Maintenance Report</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceReport;
