
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Check, X, MoreVertical, FileText, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type OrderStatus = "pending" | "approved" | "rejected" | "sent";

type OrderItem = {
  itemId: string;
  name: string;
  quantity: number;
};

type Order = {
  id: string;
  vendorId: string;
  vendorName: string;
  date: string;
  requestor: string;
  status: OrderStatus;
  items: OrderItem[];
  notes: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  sentAt?: string;
};

// Sample order data - in a real app this would come from a database or API
const initialOrders: Order[] = [
  {
    id: "PO-2025-001",
    vendorId: "1",
    vendorName: "Office Supplies Co.",
    date: "2025-04-01",
    requestor: "John Smith",
    status: "pending",
    items: [
      { itemId: "towels", name: "Hand Towels", quantity: 50 },
      { itemId: "soap", name: "Bath Soap", quantity: 100 },
    ],
    notes: "Needed for upcoming guest turnover",
    createdAt: "2025-04-01T08:30:00Z",
  },
  {
    id: "PO-2025-002",
    vendorId: "2",
    vendorName: "Cleaning Solutions Inc.",
    date: "2025-04-02",
    requestor: "Sarah Johnson",
    status: "approved",
    items: [
      { itemId: "detergent", name: "Laundry Detergent", quantity: 20 },
    ],
    notes: "",
    createdAt: "2025-04-02T10:15:00Z",
    approvedBy: "Admin User",
    approvedAt: "2025-04-02T14:25:00Z",
  },
  {
    id: "PO-2025-003",
    vendorId: "3",
    vendorName: "Hospitality Essentials",
    date: "2025-04-03",
    requestor: "Michael Brown",
    status: "rejected",
    items: [
      { itemId: "shampoo", name: "Shampoo", quantity: 200 },
      { itemId: "toilet_paper", name: "Toilet Paper", quantity: 300 },
    ],
    notes: "Urgent order",
    createdAt: "2025-04-03T09:45:00Z",
    rejectedBy: "Admin User",
    rejectedAt: "2025-04-03T11:05:00Z",
    rejectionReason: "Quantities exceed monthly budget",
  },
];

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const { canAccess } = usePermissions();
  
  const canApproveOrders = canAccess("approve_orders");

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleApproveOrder = (orderId: string) => {
    if (!canApproveOrders) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve orders.",
        variant: "destructive",
      });
      return;
    }

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "approved",
              approvedBy: "Admin User", // In a real app, this would be the current user
              approvedAt: new Date().toISOString(),
            }
          : order
      )
    );

    toast({
      title: "Order Approved",
      description: `Purchase order ${orderId} has been approved.`,
    });
  };

  const handleRejectOrder = (orderId: string, reason: string = "Not approved") => {
    if (!canApproveOrders) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reject orders.",
        variant: "destructive",
      });
      return;
    }

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "rejected",
              rejectedBy: "Admin User", // In a real app, this would be the current user
              rejectedAt: new Date().toISOString(),
              rejectionReason: reason,
            }
          : order
      )
    );

    toast({
      title: "Order Rejected",
      description: `Purchase order ${orderId} has been rejected.`,
    });
  };

  const handleSendOrder = (orderId: string) => {
    if (!canApproveOrders) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to send orders to vendors.",
        variant: "destructive",
      });
      return;
    }

    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "sent",
              sentAt: new Date().toISOString(),
            }
          : order
      )
    );

    toast({
      title: "Order Sent",
      description: `Purchase order ${orderId} has been sent to the vendor.`,
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending Approval</Badge>;
      case "approved":
        return <Badge variant="secondary">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "sent":
        return <Badge variant="default">Sent to Vendor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Requestor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.vendorName}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.requestor}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
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

                        {order.status === "pending" && canApproveOrders && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
                              <Check className="mr-2 h-4 w-4" /> Approve Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectOrder(order.id)}>
                              <X className="mr-2 h-4 w-4" /> Reject Order
                            </DropdownMenuItem>
                          </>
                        )}

                        {order.status === "approved" && canApproveOrders && (
                          <DropdownMenuItem onClick={() => handleSendOrder(order.id)}>
                            <Send className="mr-2 h-4 w-4" /> Send to Vendor
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Submitted on {new Date(selectedOrder?.createdAt || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Vendor</h3>
              <p>{selectedOrder?.vendorName}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <div className="mt-1">{selectedOrder && getStatusBadge(selectedOrder.status)}</div>
              
              {selectedOrder?.status === "rejected" && (
                <div className="mt-2 text-sm text-red-600">
                  Rejected by {selectedOrder.rejectedBy} on{" "}
                  {new Date(selectedOrder.rejectedAt || "").toLocaleString()}
                  <p className="mt-1">Reason: {selectedOrder.rejectionReason}</p>
                </div>
              )}
              
              {selectedOrder?.status === "approved" && (
                <div className="mt-2 text-sm text-green-600">
                  Approved by {selectedOrder.approvedBy} on{" "}
                  {new Date(selectedOrder.approvedAt || "").toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium">Items</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {selectedOrder?.items.map((item) => (
                  <li key={item.itemId} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedOrder?.notes && (
              <div>
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {selectedOrder?.status === "pending" && canApproveOrders && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (selectedOrder) handleRejectOrder(selectedOrder.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedOrder) handleApproveOrder(selectedOrder.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderList;
