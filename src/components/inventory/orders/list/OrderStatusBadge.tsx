
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Check } from "lucide-react";
import { OrderStatus } from "../OrderUtils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending Manager Approval
        </Badge>
      );
    case "pending_24h":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Pending &gt;24h
        </Badge>
      );
    case "manager_approved":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Check className="h-3 w-3" /> Manager Approved
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "sent":
      return <Badge variant="default" className="bg-blue-500">Sent to Vendor</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default OrderStatusBadge;
