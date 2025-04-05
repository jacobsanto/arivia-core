
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Check, 
  X, 
  MoreVertical, 
  FileText, 
  Send,
  Edit
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Order } from "../OrderUtils";

interface OrderRowActionsProps {
  order: Order;
  canApproveAsManager: boolean;
  canApproveAsAdmin: boolean;
  isSuperAdmin: boolean;
  handleViewDetails: (order: Order) => void;
  handleApproveOrder: (orderId: string) => void;
  handleSendOrder: (orderId: string) => void;
  openRejectionDialog: (order: Order) => void;
}

const OrderRowActions: React.FC<OrderRowActionsProps> = ({
  order,
  canApproveAsManager,
  canApproveAsAdmin,
  isSuperAdmin,
  handleViewDetails,
  handleApproveOrder,
  handleSendOrder,
  openRejectionDialog,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleViewDetails(order)}>
          <FileText className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>

        {order.status === "pending" && canApproveAsManager && (
          <>
            <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
              <Check className="mr-2 h-4 w-4" /> Approve as Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openRejectionDialog(order)}>
              <X className="mr-2 h-4 w-4" /> Reject Order
            </DropdownMenuItem>
          </>
        )}

        {(order.status === "manager_approved" || (order.status === "pending" && isSuperAdmin)) && canApproveAsAdmin && (
          <>
            <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
              <Check className="mr-2 h-4 w-4" /> {isSuperAdmin ? "Final Approval" : "Approve as Admin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openRejectionDialog(order)}>
              <X className="mr-2 h-4 w-4" /> Reject Order
            </DropdownMenuItem>
          </>
        )}

        {order.status === "pending_24h" && isSuperAdmin && (
          <>
            <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
              <Check className="mr-2 h-4 w-4" /> Emergency Approval
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openRejectionDialog(order)}>
              <X className="mr-2 h-4 w-4" /> Reject Order
            </DropdownMenuItem>
          </>
        )}

        {order.status === "approved" && (canApproveAsAdmin || isSuperAdmin) && (
          <DropdownMenuItem onClick={() => handleSendOrder(order.id)}>
            <Send className="mr-2 h-4 w-4" /> Send to Vendor
          </DropdownMenuItem>
        )}

        {(isSuperAdmin || canApproveAsAdmin) && order.status !== "sent" && (
          <DropdownMenuItem onClick={() => {
            toast({
              title: "Edit Order",
              description: "Order editing functionality is coming soon.",
            });
          }}>
            <Edit className="mr-2 h-4 w-4" /> Edit Order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderRowActions;
