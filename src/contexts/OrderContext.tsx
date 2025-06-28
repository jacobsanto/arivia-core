
import React, { createContext, useContext, useState } from 'react';
import { Order, OrderItem } from '../components/inventory/orders/OrderUtils';

// Removing all initial mock orders
const initialOrders: Order[] = [];

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: any) => void;
  updateOrder: (orderId: string, updatedData: Partial<Order>) => void;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  addOrder: () => {},
  updateOrder: () => {},
});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [nextId, setNextId] = useState(1); // Starting from 1
  
  // Add a new order
  const addOrder = (orderData: any) => {
    const { vendorId, date, requestor, priority, department, items, notes } = orderData;
    
    // Find the vendor name based on vendorId (you'll need to implement this logic)
    const getVendorName = (id: string) => {
      // This will be replaced with actual vendor fetching from database
      return "Unknown Vendor";
    };

    // Generate a new order ID
    const orderId = `PO-2025-${String(nextId).padStart(3, '0')}`;
    setNextId(nextId + 1);

    // Create the order object with required fields
    const newOrder: Order = {
      id: orderId,
      vendorId,
      vendorName: getVendorName(vendorId),
      date,
      requestor,
      requesterRole: "housekeeping_staff", // This should come from the user context
      department,
      priority,
      status: "pending",
      items: items.map((item: any) => ({
        itemId: item.itemId,
        name: "Item Name", // This should come from your item database
        quantity: item.quantity,
      })),
      notes,
      createdAt: new Date().toISOString(),
    };

    // Add the new order to the orders array
    setOrders([...orders, newOrder]);
    
    return orderId;
  };

  // Update an existing order
  const updateOrder = (orderId: string, updatedData: Partial<Order>) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, ...updatedData }
          : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
