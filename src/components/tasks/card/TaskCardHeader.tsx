
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TaskCardHeaderProps {
  title: string;
  type: string;
  approvalStatus: "Approved" | "Rejected" | "Pending" | null;
  property: string;
}

export const TaskCardHeader = ({
  title,
  type,
  approvalStatus,
  property
}: TaskCardHeaderProps) => {
  const approvalIcon = approvalStatus === "Approved" ? (
    <CheckCircle className="h-4 w-4 text-green-600" />
  ) : approvalStatus === "Rejected" ? (
    <XCircle className="h-4 w-4 text-red-600" />
  ) : approvalStatus === "Pending" ? (
    <Clock className="h-4 w-4 text-yellow-600" />
  ) : null;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <h3 className="font-medium">{title}</h3>
        <Badge
          variant="outline"
          className="border-blue-200 text-blue-800"
        >
          {type}
        </Badge>
        {approvalIcon}
      </div>
      <p className="text-sm text-muted-foreground">{property}</p>
    </div>
  );
};
