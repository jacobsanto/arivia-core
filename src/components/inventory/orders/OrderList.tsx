
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toastService } from "@/services/toast/toast.service";
import { orderService } from "@/services/orders/order.service";

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
      const checkOverdueOrders = async () => {
        try {
          const pendingOverdueOrders = await orderService.getPendingOverdueOrders();
          
          if (pendingOverdueOrders.length > 0) {
            toastService.warning("Attention Required", {
              description: `${pendingOverdueOrders.length} order(s) pending for more than 24 hours`
            });
          }
        } catch (error) {
          console.error("Error checking overdue orders:", error);
        }
      };
      
      checkOverdueOrders();
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

  const handleApproveOrder = async (orderId: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate) return;

    const canApprove = canTakeActionOnOrder(orderToUpdate.status, userRole as any);
    
    if (!canApprove) {
      toastService.error("Access Denied", {
        description: "You don't have permission to approve this order."
      });
      return;
    }

    const nextStatus = getNextOrderStatus(orderToUpdate.status, userRole as any);
    
    try {
      // Update the order using the order service
      await orderService.updateOrderStatus(orderId, nextStatus as OrderStatus, user);
      
      // Update the UI state
      updateOrder(orderId, { status: nextStatus });
      
      // Send notification (this should eventually be handled by the service)
      sendOrderNotification(nextStatus as OrderStatus, orderId, orderToUpdate);
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!rejectionReason) {
      toastService.error("Reason Required", {
        description: "Please provide a rejection reason."
      });
      return;
    }

    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate) return;

    const canReject = canTakeActionOnOrder(orderToUpdate.status, userRole as any);
    
    if (!canReject) {
      toastService.error("Access Denied", {
        description: "You don't have permission to reject this order."
      });
      return;
    }
    
    try {
      // Update the order using the order service
      await orderService.updateOrderStatus(orderId, 'rejected', user, rejectionReason);
      
      // Update the UI state
      updateOrder(orderId, { 
        status: 'rejected',
        rejectedBy: user?.name,
        rejectedAt: new Date().toISOString(),
        rejectionReason: rejectionReason,
      });
      
      // Send notification (this should eventually be handled by the service)
      sendOrderNotification('rejected', orderId, { rejectedBy: user?.name, reason: rejectionReason });
      
      setIsDetailsOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const handleSendOrder = async (orderId: string) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (!orderToUpdate || orderToUpdate.status !== "approved") return;

    if (!canApproveAsAdmin && !isSuperAdmin) {
      toastService.error("Access Denied", {
        description: "You don't have permission to send orders to vendors."
      });
      return;
    }

    try {
      // Update the order using the order service
      await orderService.updateOrderStatus(orderId, 'sent', user);
      
      // Update the UI state
      updateOrder(orderId, { 
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
      
      // Send notification (this should eventually be handled by the service)
      sendOrderNotification('sent', orderId, orderToUpdate);
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error("Error sending order:", error);
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
