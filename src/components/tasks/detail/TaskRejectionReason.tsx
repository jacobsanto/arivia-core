
import React from "react";

interface TaskRejectionReasonProps {
  reason: string | null;
}

const TaskRejectionReason = ({ reason }: TaskRejectionReasonProps) => {
  if (!reason) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-red-600">Rejection Reason</h3>
      <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-md border border-red-100">
        {reason}
      </p>
    </div>
  );
};

export default TaskRejectionReason;
