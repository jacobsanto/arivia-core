
import React from "react";
import { Button } from "@/components/ui/button";

interface TaskActionsProps {
  onClose: () => void;
  onComplete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  status: string;
  approvalStatus: "Approved" | "Rejected" | "Pending" | null;
  isManager: boolean;
  canComplete: boolean;
  isMobile: boolean;
}

const TaskActions = ({ 
  onClose, 
  onComplete, 
  onApprove, 
  onReject,
  status,
  approvalStatus,
  isManager,
  canComplete,
  isMobile
}: TaskActionsProps) => {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <Button variant="outline" onClick={onClose} size={isMobile ? "sm" : "default"}>
        Close
      </Button>
      <div className="flex gap-2">
        {/* Staff can complete tasks */}
        {status !== "Completed" && !isManager && (
          <Button
            onClick={onComplete}
            disabled={!canComplete}
            size={isMobile ? "sm" : "default"}
          >
            Mark as Complete
          </Button>
        )}

        {/* Managers can approve/reject completed tasks */}
        {isManager && status === "Completed" && approvalStatus !== "Approved" && (
          <>
            <Button
              variant="destructive"
              onClick={onReject}
              size={isMobile ? "sm" : "default"}
            >
              Reject
            </Button>
            <Button
              variant="default"
              onClick={onApprove}
              className="bg-green-600 hover:bg-green-700"
              size={isMobile ? "sm" : "default"}
            >
              Approve
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskActions;
