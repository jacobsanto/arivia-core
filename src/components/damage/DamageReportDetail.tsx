import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DamageReport } from "@/services/damage/damage.service";
import { format } from "date-fns";
import { useUser } from "@/contexts/UserContext";
import { FileUpload } from "@/components/ui/file-upload";

type DamageReportStatus = "pending" | "investigating" | "resolved" | "compensation_required" | "compensation_paid" | "closed";

interface DamageReportDetailProps {
  report: DamageReport;
  onClose: () => void;
  onUpdate: (reportId: string, updates: Partial<DamageReport>) => Promise<any>;
  onMediaUpload: (file: File, reportId: string) => Promise<string | null>;
  canEdit: boolean;
}

const DamageReportDetail: React.FC<DamageReportDetailProps> = ({
  report,
  onClose,
  onUpdate,
  onMediaUpload,
  canEdit,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [status, setStatus] = useState<DamageReportStatus>(report.status as DamageReportStatus);
  const [conclusion, setConclusion] = useState(report.conclusion || "");
  const [estimatedCost, setEstimatedCost] = useState(report.estimated_cost?.toString() || "");
  const [finalCost, setFinalCost] = useState(report.final_cost?.toString() || "");
  const [compensationAmount, setCompensationAmount] = useState(
    report.compensation_amount?.toString() || ""
  );
  const [compensationNotes, setCompensationNotes] = useState(report.compensation_notes || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useUser();

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const updates: Partial<DamageReport> = {
        status,
        conclusion,
      };
      
      if (estimatedCost) updates.estimated_cost = parseFloat(estimatedCost);
      if (finalCost) updates.final_cost = parseFloat(finalCost);
      if (compensationAmount) updates.compensation_amount = parseFloat(compensationAmount);
      if (compensationNotes) updates.compensation_notes = compensationNotes;
      
      if (status === "resolved" || status === "closed") {
        updates.resolution_date = new Date().toISOString();
      }

      await onUpdate(report.id, updates);
      handleClose();
    } catch (error) {
      console.error("Error updating report:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMediaUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    try {
      const file = files[0];
      await onMediaUpload(file, report.id);
    } catch (error) {
      console.error("Error uploading media:", error);
    }
  };

  const renderStatusOptions = () => {
    if (user?.role === "administrator" || user?.role === "property_manager") {
      return (
        <>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="investigating">Investigating</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="compensation_required">Compensation Required</SelectItem>
          <SelectItem value="compensation_paid">Compensation Paid</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </>
      );
    }
    
    return (
      <>
        <SelectItem value="pending">Pending</SelectItem>
        {report.assigned_to === user?.id && (
          <>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </>
        )}
      </>
    );
  };

  const canResolve = user?.role === "superadmin" || 
                    user?.role === "tenant_admin" || 
                    user?.role === "property_manager";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{report.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Reported By</p>
              <p className="text-sm">{report.reported_by}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Damage Date</p>
              <p className="text-sm">
                {format(new Date(report.damage_date), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Report Date</p>
              <p className="text-sm">
                {format(new Date(report.created_at), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              {canEdit ? (
                <Select 
                  value={status} 
                  onValueChange={(value: DamageReportStatus) => setStatus(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {renderStatusOptions()}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm capitalize">{report.status.replace("_", " ")}</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Description</p>
            <p className="text-sm border rounded p-2 bg-muted/50">{report.description}</p>
          </div>

          {canEdit && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium">Cost Estimates</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs mb-1">Estimated Cost</p>
                    <Input 
                      type="number" 
                      value={estimatedCost} 
                      onChange={(e) => setEstimatedCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1">Final Cost</p>
                    <Input 
                      type="number" 
                      value={finalCost} 
                      onChange={(e) => setFinalCost(e.target.value)} 
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {(status === "compensation_required" || status === "compensation_paid") && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compensation Details</p>
                  <div>
                    <p className="text-xs mb-1">Compensation Amount</p>
                    <Input 
                      type="number" 
                      value={compensationAmount} 
                      onChange={(e) => setCompensationAmount(e.target.value)}
                      disabled={status === "compensation_paid"}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <p className="text-xs mb-1">Notes</p>
                    <Textarea 
                      value={compensationNotes} 
                      onChange={(e) => setCompensationNotes(e.target.value)}
                      disabled={status === "compensation_paid"}
                      placeholder="Enter compensation notes..."
                    />
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Resolution/Conclusion</p>
                <Textarea 
                  value={conclusion} 
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="Enter conclusion or resolution details..."
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Upload Evidence</p>
                <FileUpload
                  onChange={handleMediaUpload}
                  accept="image/*,video/*"
                  isDisabled={!canEdit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload photos or videos as evidence
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DamageReportDetail;
