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
      notes: 'Standard checkout cleaning completed'
    }
  ];

  return mockTasks.filter(task => {
    if (filters.property && task.property !== filters.property) return false;
    if (filters.assignee && task.assignee !== filters.assignee) return false;
    if (filters.status && task.status !== filters.status) return false;
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
      technician: 'Nikos Stavros'
    },
    {
      property: 'Villa Azure',
      taskType: 'Pool Maintenance',
      description: 'Filter Replacement',
      laborCost: 80,
      materialsCost: 65,
      totalCost: 145,
      date: '2024-01-12',
      technician: 'Dimitris Papadakis'
    },
    {
      property: 'Villa Sunset',
      taskType: 'Electrical',
      description: 'Light Fixture Installation',
      laborCost: 200,
      materialsCost: 85,
      totalCost: 285,
      date: '2024-01-10',
      technician: 'Yannis Korres'
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
      status: 'Resolved'
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
      status: 'In Progress'
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
      status: 'Pending'
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
      location: 'Main Storage'
    },
    {
      itemName: 'Toilet Paper',
      sku: 'TOI-001', 
      category: 'Toiletries',
      currentStock: 8,
      reorderLevel: 12,
      unitCost: 2.25,
      totalValue: 18.00,
      location: 'Main Storage'
    },
    {
      itemName: 'Pool Chemicals',
      sku: 'POOL-001',
      category: 'Maintenance',
      currentStock: 5,
      reorderLevel: 8,
      unitCost: 45.00,
      totalValue: 225.00,
      location: 'Pool Storage'
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
            { key: 'completedDate', label: 'Completed Date', type: 'date' },
            { key: 'timeSpent', label: 'Time Spent' },
            { key: 'notes', label: 'Notes' }
          ];
          title = 'Task Completion Log';
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
            { key: 'technician', label: 'Technician' }
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
            { key: 'status', label: 'Status' }
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
            { key: 'location', label: 'Location' }
          ];
          title = 'Inventory Levels Report';
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