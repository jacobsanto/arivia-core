
import React from "react";
import { Badge } from "@/components/ui/badge";

interface GuestyStatusBadgeProps {
  type: "booking" | "task";
  status: string;
  className?: string;
}

const GuestyStatusBadge: React.FC<GuestyStatusBadgeProps> = ({
  type,
  status,
  className
}) => {
  let variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "success"
    | "warning" = "default";
  
  // Status colors for bookings
  if (type === "booking") {
    switch (status) {
      case "confirmed":
        variant = "success";
        break;
      case "pending":
      case "inquiry":
      case "pendingOwnerConfirmation":
        variant = "warning";
        break;
      case "cancelled":
      case "canceled":
      case "declined":
        variant = "destructive";
        break;
      default:
        variant = "secondary";
    }
  }
  
  // Status colors for tasks
  if (type === "task") {
    switch (status) {
      case "completed":
        variant = "success";
        break;
      case "pending":
        variant = "warning";
        break;
      case "in_progress":
      case "inProgress":
        variant = "default";
        break;
      case "cancelled":
      case "canceled":
        variant = "destructive";
        break;
      default:
        variant = "secondary";
    }
  }
  
  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case "pendingOwnerConfirmation":
        return "Awaiting Confirmation";
      case "inProgress":
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  return (
    <Badge variant={variant} className={className}>
      {formatStatus(status)}
    </Badge>
  );
};

export default GuestyStatusBadge;
