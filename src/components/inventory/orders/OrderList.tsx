import React, { useState, useEffect } from "react";
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
import { useUser } from "@/contexts/UserContext";
import { useOrders } from "@/contexts/OrderContext";
import { 
  Check, 
  X, 
  MoreVertical, 
  FileText, 
  Send, 
  AlertTriangle,
  Edit,
  Clock,
  Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Order, 
  OrderStatus, 
  OrderItem,
  canTakeActionOnOrder, 
  getNextOrderStatus, 
  sendOrderNotification 
} from "./OrderUtils";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OrderList: React.FC = () => {
  const { orders, updateOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  const { canAccess } = usePermissions();
  const { user } = useUser();
  
  const userRole = user?.role || "concierge";
  const canViewOrders = ["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff"].includes(userRole);
  const canApproveAsManager = ["superadmin", "property_manager"].includes(userRole);
  const canApproveAsAdmin = ["superadmin", "administrator"].includes(userRole);
  const isSuperAdmin = userRole === "superadmin";

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== "all" && order.status !== filterStatus) {
      return false;
    }

    if (filterDepartment !== "all" && order.department !== filterDepartment) {
      return false;
    }

    if (searchQuery && !(
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requestor.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }

    if (userRole === "housekeeping_staff" && order.requesterRole !== "housekeeping_staff") {
      return false;
    }

    if (userRole === "maintenance_staff" && order.requesterRole !== "maintenance_staff") {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (isSuperAdmin) {
      const pendingOverdueOrders = orders.filter(order => order.status === "pending_24h");
      
      if (pendingOverdueOrders.length > 0) {
        toast({
          title: "Attention Required",
          description: `${pendingOverdueOrders.length} order(s) pending for more than 24 hours`,
          variant: "destructive",
        });
      }
    }
  }, [orders, isSuperAdmin]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setRejectionReason("");
  };

  const handleApproveOrder = (orderId: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate) return;

    const canApprove = canTakeActionOnOrder(orderToUpdate.status, userRole as any);
    
    if (!canApprove) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to approve this order.",
        variant: "destructive",
      });
      return;
    }

    const nextStatus = getNextOrderStatus(orderToUpdate.status, userRole as any);
    
    const now = new Date().toISOString();
    let updatedOrder: Partial<Order> = { status: nextStatus };

    if (orderToUpdate.status === "pending" && canApproveAsManager) {
      updatedOrder = {
        ...updatedOrder,
        status: "manager_approved",
        managerApprovedBy: user?.name,
        managerApprovedAt: now,
      };
    } else if ((orderToUpdate.status === "manager_approved" || orderToUpdate.status === "pending") && canApproveAsAdmin) {
      updatedOrder = {
        ...updatedOrder,
        status: "approved",
        adminApprovedBy: user?.name,
        adminApprovedAt: now,
      };
    }

    updateOrder(orderId, updatedOrder);
    sendOrderNotification(updatedOrder.status as OrderStatus, orderId, orderToUpdate);

    toast({
      title: "Order Approved",
      description: `Purchase order ${orderId} has been approved.`,
    });
    
    setIsDetailsOpen(false);
  };

  const handleRejectOrder = (orderId: string) => {
    if (!rejectionReason) {
      toast({
        title: "Reason Required",
        description: "Please provide a rejection reason.",
        variant: "destructive",
      });
      return;
    }

    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate) return;

    const canReject = canTakeActionOnOrder(orderToUpdate.status, userRole as any);
    
    if (!canReject) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to reject this order.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date().toISOString();

    updateOrder(orderId, {
      status: "rejected",
      rejectedBy: user?.name,
      rejectedAt: now,
      rejectionReason: rejectionReason,
    });

    sendOrderNotification("rejected" as OrderStatus, orderId, { rejectedBy: user?.name, reason: rejectionReason });

    toast({
      title: "Order Rejected",
      description: `Purchase order ${orderId} has been rejected.`,
    });

    setIsDetailsOpen(false);
    setRejectionReason("");
  };

  const handleSendOrder = (orderId: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate || orderToUpdate.status !== "approved") return;

    if (!canApproveAsAdmin && !isSuperAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to send orders to vendors.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toISOString();

    updateOrder(orderId, {
      status: "sent",
      sentAt: now,
    });

    sendOrderNotification("sent" as OrderStatus, orderId, orderToUpdate);

    toast({
      title: "Order Sent",
      description: `Purchase order ${orderId} has been sent to the vendor.`,
    });
    
    setIsDetailsOpen(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending Manager Approval
               </Badge>;
      case "pending_24h":
        return <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Pending &gt;24h
               </Badge>;
      case "manager_approved":
        return <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Manager Approved
               </Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                Approved
               </Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "sent":
        return <Badge variant="default" className="bg-blue-500">Sent to Vendor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-gray-100">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800">URGENT</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (!canViewOrders) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">You don't have permission to view orders.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Purchase Orders</CardTitle>
            
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-2 border-t">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={filterStatus} 
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pending_24h">Pending &gt;24h</SelectItem>
                    <SelectItem value="manager_approved">Manager Approved</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Department</label>
                <Select 
                  value={filterDepartment} 
                  onValueChange={setFilterDepartment}
                >
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Requestor</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.requestor}</TableCell>
                      <TableCell className="hidden md:table-cell">{getPriorityBadge(order.priority)}</TableCell>
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

                            {order.status === "pending" && canApproveAsManager && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
                                  <Check className="mr-2 h-4 w-4" /> Approve as Manager
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDetailsOpen(true);
                                }}>
                                  <X className="mr-2 h-4 w-4" /> Reject Order
                                </DropdownMenuItem>
                              </>
                            )}

                            {(order.status === "manager_approved" || (order.status === "pending" && isSuperAdmin)) && canApproveAsAdmin && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
                                  <Check className="mr-2 h-4 w-4" /> {isSuperAdmin ? "Final Approval" : "Approve as Admin"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDetailsOpen(true);
                                }}>
                                  <X className="mr-2 h-4 w-4" /> Reject Order
                                </DropdownMenuItem>
                              </>
                            )}

                            {order.status === "pending_24h" && isSuperAdmin && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveOrder(order.id)}>
                                  <Check className="mr-2 h-4 w-4" /> Emergency Approval
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDetailsOpen(true);
                                }}>
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No orders found matching the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order {selectedOrder?.id}</span>
              {selectedOrder && getPriorityBadge(selectedOrder.priority)}
            </DialogTitle>
            <DialogDescription>
              Submitted on {new Date(selectedOrder?.createdAt || "").toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Vendor</h3>
                <p>{selectedOrder?.vendorName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Department</h3>
                <p className="capitalize">{selectedOrder?.department}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Requested By</h3>
                <p>{selectedOrder?.requestor}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Date Needed</h3>
                <p>{selectedOrder?.date}</p>
              </div>
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
              
              {selectedOrder?.status === "manager_approved" && (
                <div className="mt-2 text-sm text-green-600">
                  Approved by {selectedOrder.managerApprovedBy} on{" "}
                  {new Date(selectedOrder.managerApprovedAt || "").toLocaleString()}
                </div>
              )}
              
              {selectedOrder?.status === "approved" && (
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
                {selectedOrder?.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
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

            {selectedOrder && (selectedOrder.status === "pending" || selectedOrder.status === "manager_approved" || selectedOrder.status === "pending_24h") && (canApproveAsManager || canApproveAsAdmin || isSuperAdmin) && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Rejection Reason (if rejecting)</h3>
                <Input
                  placeholder="Reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}

            {selectedOrder && (selectedOrder.status === "pending" || selectedOrder.status === "manager_approved" || selectedOrder.status === "pending_24h") && (canApproveAsManager || canApproveAsAdmin || isSuperAdmin) && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsOpen(false)}
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
            
            {selectedOrder && selectedOrder.status === "approved" && (canApproveAsAdmin || isSuperAdmin) && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsOpen(false)}
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
    </>
  );
};

export default OrderList;
