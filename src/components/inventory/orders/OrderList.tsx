
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useUser } from "@/contexts/UserContext";
import { useOrders } from "@/contexts/OrderContext";
import { 
  Order, 
  OrderStatus, 
  canTakeActionOnOrder, 
  getNextOrderStatus, 
  sendOrderNotification 
} from "./OrderUtils";
import OrdersFilterBar from "./list/OrdersFilterBar";
import OrderTable from "./list/OrderTable";
import OrderDetailsDialog from "./details/OrderDetailsDialog";

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

  const openRejectionDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
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
            
            <OrdersFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterDepartment={filterDepartment}
              setFilterDepartment={setFilterDepartment}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
            />
          </div>
        </CardHeader>
        <CardContent>
          <OrderTable
            filteredOrders={filteredOrders}
            canApproveAsManager={canApproveAsManager}
            canApproveAsAdmin={canApproveAsAdmin}
            isSuperAdmin={isSuperAdmin}
            handleViewDetails={handleViewDetails}
            handleApproveOrder={handleApproveOrder}
            handleSendOrder={handleSendOrder}
            openRejectionDialog={openRejectionDialog}
          />
        </CardContent>
      </Card>

      <OrderDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        selectedOrder={selectedOrder}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        canApproveAsManager={canApproveAsManager}
        canApproveAsAdmin={canApproveAsAdmin}
        isSuperAdmin={isSuperAdmin}
        handleApproveOrder={handleApproveOrder}
        handleRejectOrder={handleRejectOrder}
        handleSendOrder={handleSendOrder}
      />
    </>
  );
};

export default OrderList;
