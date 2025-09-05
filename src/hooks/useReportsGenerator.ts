import { useState } from 'react';
import { ReportType, GeneratedReport, ReportFilters, ReportGeneratorState } from '@/types/reports.types';
import { toast } from '@/hooks/use-toast';

// Mock data generators for different report types
const generateTaskCompletionData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockTasks = [
    {
      id: 'TASK-001',
      property: 'Villa Caldera',
      type: 'Housekeeping',
      title: 'Deep Clean Living Room',
      assignee: 'Maria Kostas',
      status: 'Completed',
      completedDate: '2024-01-15',
      timeSpent: '2.5 hours',
      priority: 'High',
      notes: 'All surfaces cleaned, fresh linens applied'
    },
    {
      id: 'TASK-002', 
      property: 'Villa Azure',
      type: 'Maintenance',
      title: 'Fix Pool Filter',
      assignee: 'Nikos Stavros',
      status: 'In Progress',
      completedDate: '',
      timeSpent: '1.0 hours',
      priority: 'Medium',
      notes: 'Replacement part ordered'
    },
    {
      id: 'TASK-003',
      property: 'Villa Sunset',
      type: 'Housekeeping', 
      title: 'Guest Checkout Clean',
      assignee: 'Elena Dimitriou',
      status: 'Completed',
      completedDate: '2024-01-14',
      timeSpent: '3.0 hours',
      priority: 'High',
      notes: 'Standard checkout cleaning completed'
    },
    {
      id: 'TASK-004',
      property: 'Villa Caldera',
      type: 'Maintenance',
      title: 'Air Conditioning Service',
      assignee: 'Dimitris Papadakis',
      status: 'Completed',
      completedDate: '2024-01-13',
      timeSpent: '4.0 hours',
      priority: 'High',
      notes: 'Annual maintenance completed'
    }
  ];

  return mockTasks.filter(task => {
    if (filters.property && task.property !== filters.property) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    if (filters.status && task.status !== filters.status) return false;
    return true;
  });
};

const generateStaffProductivityData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockData = [
    {
      employeeName: 'Maria Kostas',
      property: 'Villa Caldera',
      role: 'Housekeeping',
      tasksCompleted: 28,
      avgTaskTime: '2.3 hours',
      efficiencyRating: '94%',
      totalHours: 64.4,
      qualityScore: 9.2,
      guestRating: 4.8
    },
    {
      employeeName: 'Nikos Stavros',
      property: 'Villa Azure',
      role: 'Maintenance',
      tasksCompleted: 15,
      avgTaskTime: '3.8 hours',
      efficiencyRating: '87%',
      totalHours: 57.0,
      qualityScore: 8.9,
      guestRating: 4.6
    },
    {
      employeeName: 'Elena Dimitriou',
      property: 'Villa Sunset',
      role: 'Housekeeping',
      tasksCompleted: 32,
      avgTaskTime: '2.1 hours',
      efficiencyRating: '96%',
      totalHours: 67.2,
      qualityScore: 9.5,
      guestRating: 4.9
    }
  ];

  return mockData.filter(item => {
    if (filters.property && item.property !== filters.property) return false;
    if (filters.assignee && item.employeeName !== filters.assignee) return false;
    return true;
  });
};

const generateFinancialSummaryData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockData = [
    {
      property: 'Villa Caldera',
      revenue: 8500,
      expenses: 2100,
      maintenance: 450,
      cleaning: 380,
      utilities: 520,
      netProfit: 6050,
      occupancyRate: '78%',
      avgNightlyRate: 195
    },
    {
      property: 'Villa Azure',
      revenue: 9200,
      expenses: 2350,
      maintenance: 320,
      cleaning: 420,
      utilities: 480,
      netProfit: 6630,
      occupancyRate: '82%',
      avgNightlyRate: 210
    },
    {
      property: 'Villa Sunset',
      revenue: 7800,
      expenses: 1950,
      maintenance: 280,
      cleaning: 350,
      utilities: 450,
      netProfit: 5770,
      occupancyRate: '75%',
      avgNightlyRate: 185
    }
  ];

  return mockData.filter(item => {
    if (filters.property && item.property !== filters.property) return false;
    return true;
  });
};

const generatePropertyPerformanceData = (filters: ReportFilters) => {
  const mockData = [
    {
      property: 'Villa Caldera',
      totalBookings: 42,
      occupancyRate: '78%',
      avgRating: 4.7,
      totalRevenue: 25500,
      maintenanceScore: 92,
      cleanlinessScore: 94,
      responseTime: '2.3 hours',
      repeatGuests: '35%'
    },
    {
      property: 'Villa Azure',
      totalBookings: 38,
      occupancyRate: '82%',
      avgRating: 4.8,
      totalRevenue: 27600,
      maintenanceScore: 89,
      cleanlinessScore: 96,
      responseTime: '1.8 hours',
      repeatGuests: '42%'
    },
    {
      property: 'Villa Sunset',
      totalBookings: 35,
      occupancyRate: '75%',
      avgRating: 4.6,
      totalRevenue: 23400,
      maintenanceScore: 88,
      cleanlinessScore: 91,
      responseTime: '2.7 hours',
      repeatGuests: '28%'
    }
  ];

  return mockData.filter(item => {
    if (filters.property && item.property !== filters.property) return false;
    return true;
  });
};

const generateBookingAnalyticsData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockData = [
    {
      bookingId: 'BK-001',
      property: 'Villa Caldera',
      source: 'Airbnb',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      nights: 3,
      guests: 4,
      leadTime: 25,
      revenue: 585,
      commission: 87.75,
      netRevenue: 497.25
    },
    {
      bookingId: 'BK-002',
      property: 'Villa Azure',
      source: 'Booking.com',
      checkIn: '2024-01-20',
      checkOut: '2024-01-25',
      nights: 5,
      guests: 6,
      leadTime: 45,
      revenue: 1050,
      commission: 126.00,
      netRevenue: 924.00
    },
    {
      bookingId: 'BK-003',
      property: 'Villa Sunset',
      source: 'Direct',
      checkIn: '2024-01-12',
      checkOut: '2024-01-14',
      nights: 2,
      guests: 2,
      leadTime: 60,
      revenue: 370,
      commission: 0,
      netRevenue: 370
    }
  ];

  return mockData.filter(item => {
    if (filters.property && item.property !== filters.property) return false;
    if (filters.source && item.source !== filters.source) return false;
    return true;
  });
};

const generateGuestSatisfactionData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockData = [
    {
      property: 'Villa Caldera',
      source: 'Airbnb',
      totalReviews: 28,
      avgRating: 4.7,
      cleanlinessRating: 4.8,
      communicationRating: 4.6,
      locationRating: 4.9,
      valueRating: 4.5,
      responseRate: '98%',
      issuesReported: 2
    },
    {
      property: 'Villa Azure', 
      source: 'Booking.com',
      totalReviews: 35,
      avgRating: 4.8,
      cleanlinessRating: 4.9,
      communicationRating: 4.7,
      locationRating: 4.8,
      valueRating: 4.7,
      responseRate: '100%',
      issuesReported: 1
    },
    {
      property: 'Villa Sunset',
      source: 'Google',
      totalReviews: 22,
      avgRating: 4.6,
      cleanlinessRating: 4.7,
      communicationRating: 4.5,
      locationRating: 4.8,
      valueRating: 4.4,
      responseRate: '95%',
      issuesReported: 3
    }
  ];

  return mockData.filter(item => {
    if (filters.property && item.property !== filters.property) return false;
    if (filters.source && item.source !== filters.source) return false;
    return true;
  });
};

const generateMaintenanceCostData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockCosts = [
    {
      property: 'Villa Caldera',
      taskType: 'Plumbing',
      description: 'Toilet Repair',
      laborCost: 120,
      materialsCost: 35,
      totalCost: 155,
      date: '2024-01-15',
      technician: 'Nikos Stavros',
      urgency: 'High'
    },
    {
      property: 'Villa Azure',
      taskType: 'Pool Maintenance',
      description: 'Filter Replacement',
      laborCost: 80,
      materialsCost: 65,
      totalCost: 145,
      date: '2024-01-12',
      technician: 'Dimitris Papadakis',
      urgency: 'Medium'
    },
    {
      property: 'Villa Sunset',
      taskType: 'Electrical',
      description: 'Light Fixture Installation',
      laborCost: 200,
      materialsCost: 85,
      totalCost: 285,
      date: '2024-01-10',
      technician: 'Yannis Korres',
      urgency: 'Low'
    }
  ];

  return mockCosts.filter(cost => {
    if (filters.property && cost.property !== filters.property) return false;
    if (filters.category && cost.taskType !== filters.category) return false;
    return true;
  });
};

const generateDamageHistoryData = (filters: ReportFilters, startDate: string, endDate: string) => {
  const mockDamages = [
    {
      id: 'DMG-001',
      property: 'Villa Caldera',
      location: 'Living Room',
      description: 'Broken wine glass on coffee table',
      source: 'Guest',
      severity: 'Minor',
      reportedDate: '2024-01-14',
      repairCost: 25,
      status: 'Resolved',
      reportedBy: 'Maria Kostas'
    },
    {
      id: 'DMG-002',
      property: 'Villa Azure', 
      location: 'Kitchen',
      description: 'Scratched countertop surface',
      source: 'Staff',
      severity: 'Moderate',
      reportedDate: '2024-01-12',
      repairCost: 180,
      status: 'In Progress',
      reportedBy: 'Nikos Stavros'
    },
    {
      id: 'DMG-003',
      property: 'Villa Sunset',
      location: 'Bathroom',
      description: 'Cracked mirror',
      source: 'Unknown',
      severity: 'Minor',
      reportedDate: '2024-01-10',
      repairCost: 75,
      status: 'Pending',
      reportedBy: 'Elena Dimitriou'
    }
  ];

  return mockDamages.filter(damage => {
    if (filters.property && damage.property !== filters.property) return false;
    if (filters.source && damage.source !== filters.source) return false;
    if (filters.status && damage.status !== filters.status) return false;
    return true;
  });
};

const generateInventoryLevelsData = (filters: ReportFilters) => {
  const mockInventory = [
    {
      itemName: 'Bath Towels',
      sku: 'TOW-001',
      category: 'Linens',
      currentStock: 25,
      reorderLevel: 15,
      unitCost: 18.50,
      totalValue: 462.50,
      location: 'Main Storage',
      supplier: 'Villa Supplies Co',
      lastOrdered: '2024-01-10'
    },
    {
      itemName: 'Toilet Paper',
      sku: 'TOI-001', 
      category: 'Toiletries',
      currentStock: 8,
      reorderLevel: 12,
      unitCost: 2.25,
      totalValue: 18.00,
      location: 'Main Storage',
      supplier: 'Bulk Supplies Ltd',
      lastOrdered: '2024-01-08'
    },
    {
      itemName: 'Pool Chemicals',
      sku: 'POOL-001',
      category: 'Maintenance',
      currentStock: 5,
      reorderLevel: 8,
      unitCost: 45.00,
      totalValue: 225.00,
      location: 'Pool Storage',
      supplier: 'Pool Pro Services',
      lastOrdered: '2024-01-05'
    }
  ];

  return mockInventory.filter(item => {
    if (filters.category && item.category !== filters.category) return false;
    return true;
  });
};

export const useReportsGenerator = () => {
  const [state, setState] = useState<ReportGeneratorState>({
    reportType: '',
    startDate: '',
    endDate: '',
    filters: {},
    isGenerating: false,
    generatedReport: null
  });

  const updateReportType = (type: ReportType | '') => {
    setState(prev => ({
      ...prev,
      reportType: type,
      filters: {}, // Reset filters when changing report type
      generatedReport: null // Clear previous report
    }));
  };

  const updateDateRange = (startDate: string, endDate: string) => {
    setState(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  };

  const updateFilters = (filters: Partial<ReportFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  const generateReport = async (): Promise<void> => {
    if (!state.reportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type before generating.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data: any[] = [];
      let columns: any[] = [];
      let title = '';

      switch (state.reportType) {
        case 'task-completion-log':
          data = generateTaskCompletionData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'id', label: 'Task ID' },
            { key: 'property', label: 'Property' },
            { key: 'type', label: 'Type' },
            { key: 'title', label: 'Title' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'completedDate', label: 'Completed Date', type: 'date' },
            { key: 'timeSpent', label: 'Time Spent' },
            { key: 'notes', label: 'Notes' }
          ];
          title = 'Task Completion Log';
          break;

        case 'staff-productivity':
          data = generateStaffProductivityData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'employeeName', label: 'Employee' },
            { key: 'property', label: 'Property' },
            { key: 'role', label: 'Role' },
            { key: 'tasksCompleted', label: 'Tasks Completed', type: 'number' },
            { key: 'avgTaskTime', label: 'Avg Task Time' },
            { key: 'efficiencyRating', label: 'Efficiency' },
            { key: 'totalHours', label: 'Total Hours', type: 'number' },
            { key: 'qualityScore', label: 'Quality Score', type: 'number' },
            { key: 'guestRating', label: 'Guest Rating', type: 'number' }
          ];
          title = 'Staff Productivity Analysis';
          break;

        case 'financial-summary':
          data = generateFinancialSummaryData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'revenue', label: 'Revenue', type: 'currency' },
            { key: 'expenses', label: 'Total Expenses', type: 'currency' },
            { key: 'maintenance', label: 'Maintenance', type: 'currency' },
            { key: 'cleaning', label: 'Cleaning', type: 'currency' },
            { key: 'utilities', label: 'Utilities', type: 'currency' },
            { key: 'netProfit', label: 'Net Profit', type: 'currency' },
            { key: 'occupancyRate', label: 'Occupancy Rate' },
            { key: 'avgNightlyRate', label: 'Avg Nightly Rate', type: 'currency' }
          ];
          title = 'Financial Summary Dashboard';
          break;

        case 'property-performance':
          data = generatePropertyPerformanceData(state.filters);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'totalBookings', label: 'Total Bookings', type: 'number' },
            { key: 'occupancyRate', label: 'Occupancy Rate' },
            { key: 'avgRating', label: 'Avg Rating', type: 'number' },
            { key: 'totalRevenue', label: 'Total Revenue', type: 'currency' },
            { key: 'maintenanceScore', label: 'Maintenance Score', type: 'number' },
            { key: 'cleanlinessScore', label: 'Cleanliness Score', type: 'number' },
            { key: 'responseTime', label: 'Response Time' },
            { key: 'repeatGuests', label: 'Repeat Guests' }
          ];
          title = 'Property Performance Dashboard';
          break;

        case 'booking-analytics':
          data = generateBookingAnalyticsData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'bookingId', label: 'Booking ID' },
            { key: 'property', label: 'Property' },
            { key: 'source', label: 'Source' },
            { key: 'checkIn', label: 'Check In', type: 'date' },
            { key: 'checkOut', label: 'Check Out', type: 'date' },
            { key: 'nights', label: 'Nights', type: 'number' },
            { key: 'guests', label: 'Guests', type: 'number' },
            { key: 'leadTime', label: 'Lead Time (days)', type: 'number' },
            { key: 'revenue', label: 'Revenue', type: 'currency' },
            { key: 'commission', label: 'Commission', type: 'currency' },
            { key: 'netRevenue', label: 'Net Revenue', type: 'currency' }
          ];
          title = 'Booking Analytics Report';
          break;

        case 'guest-satisfaction':
          data = generateGuestSatisfactionData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'source', label: 'Review Source' },
            { key: 'totalReviews', label: 'Total Reviews', type: 'number' },
            { key: 'avgRating', label: 'Avg Rating', type: 'number' },
            { key: 'cleanlinessRating', label: 'Cleanliness', type: 'number' },
            { key: 'communicationRating', label: 'Communication', type: 'number' },
            { key: 'locationRating', label: 'Location', type: 'number' },
            { key: 'valueRating', label: 'Value', type: 'number' },
            { key: 'responseRate', label: 'Response Rate' },
            { key: 'issuesReported', label: 'Issues Reported', type: 'number' }
          ];
          title = 'Guest Satisfaction Report';
          break;

        case 'maintenance-cost-breakdown':
          data = generateMaintenanceCostData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'taskType', label: 'Task Type' },
            { key: 'description', label: 'Description' },
            { key: 'laborCost', label: 'Labor Cost', type: 'currency' },
            { key: 'materialsCost', label: 'Materials Cost', type: 'currency' },
            { key: 'totalCost', label: 'Total Cost', type: 'currency' },
            { key: 'date', label: 'Date', type: 'date' },
            { key: 'technician', label: 'Technician' },
            { key: 'urgency', label: 'Urgency' }
          ];
          title = 'Maintenance Cost Breakdown';
          break;

        case 'damage-history':
          data = generateDamageHistoryData(state.filters, state.startDate, state.endDate);
          columns = [
            { key: 'id', label: 'Damage ID' },
            { key: 'property', label: 'Property' },
            { key: 'location', label: 'Location' },
            { key: 'description', label: 'Description' },
            { key: 'source', label: 'Source' },
            { key: 'severity', label: 'Severity' },
            { key: 'reportedDate', label: 'Reported Date', type: 'date' },
            { key: 'repairCost', label: 'Repair Cost', type: 'currency' },
            { key: 'status', label: 'Status' },
            { key: 'reportedBy', label: 'Reported By' }
          ];
          title = 'Damage History Report';
          break;

        case 'inventory-levels':
          data = generateInventoryLevelsData(state.filters);
          columns = [
            { key: 'itemName', label: 'Item Name' },
            { key: 'sku', label: 'SKU' },
            { key: 'category', label: 'Category' },
            { key: 'currentStock', label: 'Current Stock', type: 'number' },
            { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
            { key: 'unitCost', label: 'Unit Cost', type: 'currency' },
            { key: 'totalValue', label: 'Total Value', type: 'currency' },
            { key: 'location', label: 'Location' },
            { key: 'supplier', label: 'Supplier' },
            { key: 'lastOrdered', label: 'Last Ordered', type: 'date' }
          ];
          title = 'Inventory Levels Report';
          break;

        // Add more comprehensive report types
        case 'revenue-analysis':
          data = [
            { month: 'January', property: 'Villa Caldera', bookings: 14, revenue: 8500, occupancy: '78%', avgRate: 195 },
            { month: 'January', property: 'Villa Azure', bookings: 12, revenue: 9200, occupancy: '82%', avgRate: 210 },
            { month: 'January', property: 'Villa Sunset', bookings: 11, revenue: 7800, occupancy: '75%', avgRate: 185 }
          ].filter(item => !state.filters.property || item.property === state.filters.property);
          columns = [
            { key: 'month', label: 'Month' },
            { key: 'property', label: 'Property' },
            { key: 'bookings', label: 'Bookings', type: 'number' },
            { key: 'revenue', label: 'Revenue', type: 'currency' },
            { key: 'occupancy', label: 'Occupancy Rate' },
            { key: 'avgRate', label: 'Avg Nightly Rate', type: 'currency' }
          ];
          title = 'Revenue Analysis Report';
          break;

        case 'expense-tracking':
          data = [
            { category: 'Utilities', property: 'Villa Caldera', amount: 520, month: 'January', vendor: 'Greek Power Co' },
            { category: 'Cleaning', property: 'Villa Azure', amount: 420, month: 'January', vendor: 'Clean Pro Services' },
            { category: 'Maintenance', property: 'Villa Sunset', amount: 280, month: 'January', vendor: 'Fix It Fast' }
          ].filter(item => !state.filters.property || item.property === state.filters.property);
          columns = [
            { key: 'category', label: 'Category' },
            { key: 'property', label: 'Property' },
            { key: 'amount', label: 'Amount', type: 'currency' },
            { key: 'month', label: 'Month' },
            { key: 'vendor', label: 'Vendor' }
          ];
          title = 'Expense Tracking Report';
          break;

        case 'operational-efficiency':
          data = [
            { metric: 'Avg Checkout Time', property: 'Villa Caldera', value: '45 minutes', target: '60 minutes', efficiency: '125%' },
            { metric: 'Task Completion Rate', property: 'Villa Azure', value: '94%', target: '90%', efficiency: '104%' },
            { metric: 'Guest Response Time', property: 'Villa Sunset', value: '2.7 hours', target: '4 hours', efficiency: '148%' }
          ].filter(item => !state.filters.property || item.property === state.filters.property);
          columns = [
            { key: 'metric', label: 'Metric' },
            { key: 'property', label: 'Property' },
            { key: 'value', label: 'Current Value' },
            { key: 'target', label: 'Target' },
            { key: 'efficiency', label: 'Efficiency Score' }
          ];
          title = 'Operational Efficiency Report';
          break;

        case 'turnover-metrics':
          data = [
            { property: 'Villa Caldera', avgTurnoverTime: '3.2 hours', checkoutDelay: '15 minutes', checkinReady: '95%', guestSatisfaction: 4.7 },
            { property: 'Villa Azure', avgTurnoverTime: '2.8 hours', checkoutDelay: '8 minutes', checkinReady: '98%', guestSatisfaction: 4.8 },
            { property: 'Villa Sunset', avgTurnoverTime: '3.6 hours', checkoutDelay: '22 minutes', checkinReady: '92%', guestSatisfaction: 4.6 }
          ].filter(item => !state.filters.property || item.property === state.filters.property);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'avgTurnoverTime', label: 'Avg Turnover Time' },
            { key: 'checkoutDelay', label: 'Checkout Delay' },
            { key: 'checkinReady', label: 'Check-in Ready Rate' },
            { key: 'guestSatisfaction', label: 'Guest Satisfaction', type: 'number' }
          ];
          title = 'Property Turnover Metrics';
          break;

        case 'energy-consumption':
          data = [
            { property: 'Villa Caldera', electricity: 1250, water: 85, gas: 180, total: 1515, costPerNight: 18.50 },
            { property: 'Villa Azure', electricity: 1180, water: 92, gas: 165, total: 1437, costPerNight: 16.80 },
            { property: 'Villa Sunset', electricity: 1320, water: 78, gas: 195, total: 1593, costPerNight: 19.20 }
          ].filter(item => !state.filters.property || item.property === state.filters.property);
          columns = [
            { key: 'property', label: 'Property' },
            { key: 'electricity', label: 'Electricity (kWh)', type: 'number' },
            { key: 'water', label: 'Water (m³)', type: 'number' },
            { key: 'gas', label: 'Gas (m³)', type: 'number' },
            { key: 'total', label: 'Total Cost', type: 'currency' },
            { key: 'costPerNight', label: 'Cost per Night', type: 'currency' }
          ];
          title = 'Energy & Utilities Report';
          break;

        case 'vendor-performance':
          data = [
            { vendor: 'Clean Pro Services', category: 'Cleaning', rating: 4.8, completionRate: '98%', avgCost: 85, totalJobs: 24 },
            { vendor: 'Fix It Fast', category: 'Maintenance', rating: 4.6, completionRate: '92%', avgCost: 145, totalJobs: 18 },
            { vendor: 'Pool Pro Services', category: 'Pool Maintenance', rating: 4.9, completionRate: '100%', avgCost: 120, totalJobs: 12 }
          ].filter(item => !state.filters.category || item.category === state.filters.category);
          columns = [
            { key: 'vendor', label: 'Vendor' },
            { key: 'category', label: 'Category' },
            { key: 'rating', label: 'Rating', type: 'number' },
            { key: 'completionRate', label: 'Completion Rate' },
            { key: 'avgCost', label: 'Avg Cost', type: 'currency' },
            { key: 'totalJobs', label: 'Total Jobs', type: 'number' }
          ];
          title = 'Vendor Performance Analysis';
          break;

        case 'compliance-audit':
          data = [
            { area: 'Safety', requirement: 'Fire Safety Equipment', status: 'Compliant', lastCheck: '2024-01-10', nextDue: '2024-07-10' },
            { area: 'Health', requirement: 'Water Quality Testing', status: 'Compliant', lastCheck: '2024-01-05', nextDue: '2024-04-05' },
            { area: 'Environmental', requirement: 'Waste Management', status: 'Action Required', lastCheck: '2023-12-15', nextDue: '2024-01-15' }
          ].filter(item => !state.filters.category || item.area === state.filters.category);
          columns = [
            { key: 'area', label: 'Compliance Area' },
            { key: 'requirement', label: 'Requirement' },
            { key: 'status', label: 'Status' },
            { key: 'lastCheck', label: 'Last Check', type: 'date' },
            { key: 'nextDue', label: 'Next Due', type: 'date' }
          ];
          title = 'Compliance Audit Report';
          break;

        // Placeholder cases for other report types
        default:
          data = [{ message: 'Report type not yet implemented', reportType: state.reportType }];
          columns = [
            { key: 'message', label: 'Status' },
            { key: 'reportType', label: 'Report Type' }
          ];
          title = `${state.reportType} - Coming Soon`;
          break;
      }

      const generatedReport: GeneratedReport = {
        title,
        data,
        columns,
        type: state.reportType,
        generatedAt: new Date(),
        dateRange: state.startDate && state.endDate ? {
          startDate: state.startDate,
          endDate: state.endDate
        } : undefined,
        filters: state.filters
      };

      setState(prev => ({
        ...prev,
        generatedReport,
        isGenerating: false
      }));

      toast({
        title: "Report Generated",
        description: `${title} has been generated successfully with ${data.length} records.`
      });

    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      toast({
        title: "Report Generation Failed",
        description: "An error occurred while generating the report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearReport = () => {
    setState(prev => ({ ...prev, generatedReport: null }));
  };

  return {
    ...state,
    updateReportType,
    updateDateRange,
    updateFilters,
    generateReport,
    clearReport
  };
};