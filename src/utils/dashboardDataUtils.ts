
import { revenueByPropertyData, expenseAnalysisData } from "@/components/reports/analytics/financialData";
import { monthlyOccupancyData } from "@/components/reports/analytics/occupancyData";
import { type DateRange } from "@/components/reports/DateRangeSelector";
import { isWithinInterval, parseISO, format } from "date-fns";

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
  // Filter tasks based on date range if provided
  let filteredTasks = [...upcomingTasksData];
  
  if (dateRange && dateRange.from && dateRange.to) {
    console.log("Filtering with date range:", dateRange.from, "to", dateRange.to);
    // In a real app, you would filter tasks based on actual dates
    // This is just a simulation since our demo data doesn't have real dates
    filteredTasks = filteredTasks.slice(0, 3);
  }

  // If no property is specified or "all" is selected, return aggregated data
  if (!propertyName || propertyName === "all") {
    return {
      properties: {
        total: 5,
        occupied: 4,
        vacant: 1,
      },
      tasks: {
        total: filteredTasks.length,
        completed: Math.floor(filteredTasks.length * 0.7),
        pending: Math.ceil(filteredTasks.length * 0.3),
      },
      maintenance: {
        total: 7,
        critical: 2,
        standard: 5,
      },
      bookings: getBookingsByProperty(),
      upcomingTasks: filteredTasks,
    };
  }

  // Filter tasks for the selected property
  const propertyFilteredTasks = filteredTasks.filter(task => 
    task.title.includes(propertyName) || task.property === propertyName
  );

  // Calculate property-specific metrics
  const isOccupied = Math.random() > 0.3; // Simulate occupancy status

  return {
    properties: {
      total: 1,
      occupied: isOccupied ? 1 : 0,
      vacant: isOccupied ? 0 : 1,
    },
    tasks: {
      total: propertyFilteredTasks.length,
      completed: Math.floor(propertyFilteredTasks.length * 0.6),
      pending: Math.ceil(propertyFilteredTasks.length * 0.4),
    },
    maintenance: {
      total: Math.floor(Math.random() * 3) + 1,
      critical: Math.floor(Math.random() * 2),
      standard: Math.floor(Math.random() * 2) + 1,
    },
    bookings: getBookingsByProperty(propertyName),
    upcomingTasks: propertyFilteredTasks,
  };
};
