
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Order } from "../OrderUtils";
import OrderStatusBadge from "../list/OrderStatusBadge";
import PriorityBadge from "../list/PriorityBadge";
import { Check, Send, X } from "lucide-react";

interface OrderDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedOrder: Order | null;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  canApproveAsManager: boolean;
  canApproveAsAdmin: boolean;
  isSuperAdmin: boolean;
  handleApproveOrder: (orderId: string) => void;
  handleRejectOrder: (orderId: string) => void;
  handleSendOrder: (orderId: string) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedOrder,
  rejectionReason,
  setRejectionReason,
  canApproveAsManager,
  canApproveAsAdmin,
  isSuperAdmin,
  handleApproveOrder,
  handleRejectOrder,
  handleSendOrder,
}) => {
  if (!selectedOrder) return null;
  
  const showRejectionInput = 
    selectedOrder && 
    (selectedOrder.status === "pending" || 
     selectedOrder.status === "manager_approved" || 
     selectedOrder.status === "pending_24h") && 
    (canApproveAsManager || canApproveAsAdmin || isSuperAdmin);
  
  const showApprovalButtons = showRejectionInput;
  
  const showSendButton = 
    selectedOrder && 
    selectedOrder.status === "approved" && 
    (canApproveAsAdmin || isSuperAdmin);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order {selectedOrder.id}</span>
            <PriorityBadge priority={selectedOrder.priority} />
          </DialogTitle>
          <DialogDescription>
            Submitted on {new Date(selectedOrder.createdAt || "").toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Vendor</h3>
              <p>{selectedOrder.vendorName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Department</h3>
              <p className="capitalize">{selectedOrder.department}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Requested By</h3>
              <p>{selectedOrder.requestor}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Date Needed</h3>
              <p>{selectedOrder.date}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <div className="mt-1"><OrderStatusBadge status={selectedOrder.status} /></div>
            
            {selectedOrder.status === "rejected" && (
              <div className="mt-2 text-sm text-red-600">
                Rejected by {selectedOrder.rejectedBy} on{" "}
                {new Date(selectedOrder.rejectedAt || "").toLocaleString()}
                <p className="mt-1">Reason: {selectedOrder.rejectionReason}</p>
              </div>
            )}
            
            {selectedOrder.status === "manager_approved" && (
              <div className="mt-2 text-sm text-green-600">
                Approved by {selectedOrder.managerApprovedBy} on{" "}
                {new Date(selectedOrder.managerApprovedAt || "").toLocaleString()}
              </div>
            )}
            
            {selectedOrder.status === "approved" && (
              <div className="mt-2 text-sm text-green-600">
                Manager approval: {selectedOrder.managerApprovedBy} on{" "}
                {new Date(selectedOrder.managerApprovedAt || "").toLocaleString()}
                <br />
                Final approval: {selectedOrder.adminApprovedBy} on{" "}
                {new Date(selectedOrder.adminApprovedAt || "").toLocaleString()}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium">Items</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {selectedOrder.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>

          {selectedOrder.notes && (
            <div>
              <h3 className="text-sm font-medium">Notes</h3>
              <p className="text-sm">{selectedOrder.notes}</p>
            </div>
          )}

          {showRejectionInput && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Rejection Reason (if rejecting)</h3>
              <Input
                placeholder="Reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          {showApprovalButtons && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              
              <Button 
                variant="destructive"
                onClick={() => handleRejectOrder(selectedOrder.id)}
                disabled={!rejectionReason}
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              
              <Button 
                onClick={() => handleApproveOrder(selectedOrder.id)}
              >
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
            </div>
          )}
          
          {showSendButton && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={() => handleSendOrder(selectedOrder.id)}
              >
                <Send className="mr-2 h-4 w-4" /> Send to Vendor
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
