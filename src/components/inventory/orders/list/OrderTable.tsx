
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "../OrderUtils";
import OrderStatusBadge from "./OrderStatusBadge";
import PriorityBadge from "./PriorityBadge";
import OrderRowActions from "./OrderRowActions";

interface OrderTableProps {
  filteredOrders: Order[];
  canApproveAsManager: boolean;
  canApproveAsAdmin: boolean;
  isSuperAdmin: boolean;
  handleViewDetails: (order: Order) => void;
  handleApproveOrder: (orderId: string) => void;
  handleSendOrder: (orderId: string) => void;
  openRejectionDialog: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  filteredOrders,
  canApproveAsManager,
  canApproveAsAdmin,
  isSuperAdmin,
  handleViewDetails,
  handleApproveOrder,
  handleSendOrder,
  openRejectionDialog,
}) => {
  return (
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
                <TableCell className="hidden md:table-cell">
                  <PriorityBadge priority={order.priority} />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <OrderRowActions
                    order={order}
                    canApproveAsManager={canApproveAsManager}
                    canApproveAsAdmin={canApproveAsAdmin}
                    isSuperAdmin={isSuperAdmin}
                    handleViewDetails={handleViewDetails}
                    handleApproveOrder={handleApproveOrder}
                    handleSendOrder={handleSendOrder}
                    openRejectionDialog={openRejectionDialog}
                  />
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
  );
};

export default OrderTable;
