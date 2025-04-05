
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderItem } from '../components/inventory/orders/OrderUtils';

// Initial orders data
const initialOrders: Order[] = [
  {
    id: "PO-2025-001",
    vendorId: "1",
    vendorName: "Office Supplies Co.",
    date: "2025-04-01",
    requestor: "John Smith",
    requesterRole: "housekeeping_staff",
    department: "housekeeping",
    priority: "medium",
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
    requesterRole: "maintenance_staff",
    department: "maintenance",
    priority: "high",
    status: "manager_approved",
    items: [
      { itemId: "detergent", name: "Laundry Detergent", quantity: 20 },
    ],
    notes: "",
    createdAt: "2025-04-02T10:15:00Z",
    managerApprovedBy: "Property Manager",
    managerApprovedAt: "2025-04-02T14:25:00Z",
  },
  {
    id: "PO-2025-003",
    vendorId: "3",
    vendorName: "Hospitality Essentials",
    date: "2025-04-03",
    requestor: "Michael Brown",
    requesterRole: "housekeeping_staff",
    department: "housekeeping",
    priority: "urgent",
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
  {
    id: "PO-2025-004",
    vendorId: "1",
    vendorName: "Office Supplies Co.",
    date: "2025-04-01",
    requestor: "Alex Wong",
    requesterRole: "maintenance_staff",
    department: "maintenance",
    priority: "low",
    status: "approved",
    items: [
      { itemId: "pens", name: "Ballpoint Pens", quantity: 50 },
      { itemId: "notebooks", name: "Notebooks", quantity: 20 },
    ],
    notes: "Office supplies restock",
    createdAt: "2025-04-01T08:30:00Z",
    managerApprovedBy: "Property Manager",
    managerApprovedAt: "2025-04-01T10:30:00Z",
    adminApprovedBy: "Admin User",
    adminApprovedAt: "2025-04-01T14:15:00Z",
  },
  {
    id: "PO-2025-005",
    vendorId: "3",
    vendorName: "Hospitality Essentials",
    date: "2025-03-31",
    requestor: "Emily Chen",
    requesterRole: "housekeeping_staff",
    department: "housekeeping",
    priority: "medium",
    status: "pending_24h",
    items: [
      { itemId: "bedsheets", name: "Queen Bedsheets", quantity: 30 },
    ],
    notes: "Replacement for worn bedsheets",
    createdAt: "2025-03-31T11:20:00Z",
  },
];

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
  const [nextId, setNextId] = useState(6); // Starting from 6 since we already have 5 initial orders
  
  // Add a new order
  const addOrder = (orderData: any) => {
    const { vendorId, date, requestor, priority, department, items, notes } = orderData;
    
    // Find the vendor name based on vendorId (you'll need to implement this logic)
    const getVendorName = (id: string) => {
      // This is a placeholder. You should replace it with actual vendor fetching logic
      const vendors = {
        "1": "Office Supplies Co.",
        "2": "Cleaning Solutions Inc.",
        "3": "Hospitality Essentials",
      };
      return vendors[id as keyof typeof vendors] || "Unknown Vendor";
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
