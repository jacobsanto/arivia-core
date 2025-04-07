import { revenueByPropertyData, expenseAnalysisData, profitLossData } from "@/components/reports/analytics/financialData";
import { monthlyOccupancyData } from "@/components/reports/analytics/occupancyData";
import { type DateRange } from "@/components/reports/DateRangeSelector";

export interface DashboardData {
  properties: {
    total: number;
    occupied: number;
    vacant: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  maintenance: {
    total: number;
    critical: number;
    standard: number;
  };
  bookings: Array<{
    month: string;
    bookings: number;
  }>;
  upcomingTasks: Array<{
    id: number;
    title: string;
    type: string;
    dueDate: string;
    priority: string;
  }>;
}

const propertyNames = [
  "Villa Caldera",
  "Villa Sunset",
  "Villa Oceana", 
  "Villa Paradiso",
  "Villa Azure"
];

const upcomingTasksData = [
  {
    id: 1,
    title: "Villa Caldera Cleaning",
    type: "Housekeeping",
    dueDate: "Today, 2:00 PM",
    priority: "high",
    property: "Villa Caldera",
  },
  {
    id: 2,
    title: "Villa Azure Maintenance",
    type: "Maintenance",
    dueDate: "Today, 4:30 PM",
    priority: "medium",
    property: "Villa Azure",
  },
  {
    id: 3,
    title: "Villa Sunset Restocking",
    type: "Inventory",
    dueDate: "Tomorrow, 10:00 AM",
    priority: "medium",
    property: "Villa Sunset",
  },
  {
    id: 4,
    title: "Villa Oceana Inspection",
    type: "Housekeeping",
    dueDate: "Tomorrow, 1:00 PM",
    priority: "low",
    property: "Villa Oceana",
  },
  {
    id: 5,
    title: "Villa Paradiso Repair",
    type: "Maintenance",
    dueDate: "Apr 8, 9:00 AM",
    priority: "high",
    property: "Villa Paradiso",
  },
];

export const getBookingsByProperty = (propertyName?: string, dateRange?: DateRange) => {
  // If no property is specified, return data for all properties
  if (!propertyName || propertyName === "all") {
    return [
      { month: "Jan", bookings: 24 },
      { month: "Feb", bookings: 28 },
      { month: "Mar", bookings: 32 },
      { month: "Apr", bookings: 38 },
      { month: "May", bookings: 42 },
      { month: "Jun", bookings: 48 },
    ];
  }

  // Get occupancy data for the selected property
  const filteredData = monthlyOccupancyData.filter(item => item.property === propertyName);
  
  // Transform the data to the expected format
  return filteredData.map(item => ({
    month: item.month,
    bookings: item.bookings,
  }));
};

export const getDashboardData = (propertyName?: string, dateRange?: DateRange): DashboardData => {
  // For now we're not using the dateRange parameter for filtering
  // In a real application, you would filter data based on the dateRange

  // If no property is specified or "all" is selected, return aggregated data
  if (!propertyName || propertyName === "all") {
    return {
      properties: {
        total: 5,
        occupied: 4,
        vacant: 1,
      },
      tasks: {
        total: 18,
        completed: 12,
        pending: 6,
      },
      maintenance: {
        total: 7,
        critical: 2,
        standard: 5,
      },
      bookings: getBookingsByProperty(),
      upcomingTasks: upcomingTasksData,
    };
  }

  // Filter tasks for the selected property
  const filteredTasks = upcomingTasksData.filter(task => 
    task.title.includes(propertyName) || task.property === propertyName
  );

  // Get financial data for the selected property
  const propertyRevenue = revenueByPropertyData.find(item => item.property === propertyName);
  const propertyExpenses = expenseAnalysisData.find(item => item.property === propertyName);

  // Calculate property-specific metrics
  const isOccupied = Math.random() > 0.3; // Simulate occupancy status

  return {
    properties: {
      total: 1,
      occupied: isOccupied ? 1 : 0,
      vacant: isOccupied ? 0 : 1,
    },
    tasks: {
      total: Math.floor(Math.random() * 5) + 3,
      completed: Math.floor(Math.random() * 3) + 1,
      pending: Math.floor(Math.random() * 3) + 1,
    },
    maintenance: {
      total: Math.floor(Math.random() * 3) + 1,
      critical: Math.floor(Math.random() * 2),
      standard: Math.floor(Math.random() * 2) + 1,
    },
    bookings: getBookingsByProperty(propertyName),
    upcomingTasks: filteredTasks,
  };
};
