
import React, { createContext, useContext, useState } from "react";
import { Order } from "@/components/inventory/orders/OrderUtils";

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: any) => string;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder = (orderData: any): string => {
    const orderId = `ORDER-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      ...orderData,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [...prev, newOrder]);
    return orderId;
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
