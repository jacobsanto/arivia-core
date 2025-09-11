import { useState } from 'react';
import { ReportType, GeneratedReport, ReportFilters, ReportGeneratorState } from '@/types/reports.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  const generateTaskCompletionReport = async () => {
    const { data: tasks, error } = await supabase
      .from('housekeeping_tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        assigned_to,
        due_date,
        completed_at,
        estimated_duration,
        property_id,
        room_number
      `)
      .gte('created_at', state.startDate)
      .lte('created_at', state.endDate);

    if (error) throw error;

    return {
      title: 'Task Completion Log',
      data: (tasks || []).map(task => ({
        id: task.id,
        property: 'Property Name', // Property relationship needed
        type: 'Housekeeping',
        title: task.title,
        assignee: 'Assigned User', // User relationship needed
        status: task.status,
        priority: task.priority,
        completedDate: task.completed_at ? new Date(task.completed_at).toLocaleDateString() : '',
        timeSpent: task.estimated_duration ? `${task.estimated_duration} min` : '',
        notes: task.description || ''
      })),
      columns: [
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
      ]
    };
  };

  const generateInventoryReport = async () => {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) throw error;

    return {
      title: 'Inventory Levels',
      data: (items || []).map(item => ({
        itemName: item.name,
        sku: item.sku,
        category: 'Category Name', // Category relationship needed
        currentStock: item.quantity,
        reorderLevel: item.min_quantity,
        unitCost: item.unit_cost,
        totalValue: (item.quantity * item.unit_cost).toFixed(2),
        location: item.location,
        vendor: item.vendor,
        lastOrdered: item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
      })),
      columns: [
        { key: 'itemName', label: 'Item Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category' },
        { key: 'currentStock', label: 'Current Stock', type: 'number' },
        { key: 'reorderLevel', label: 'Reorder Level', type: 'number' },
        { key: 'unitCost', label: 'Unit Cost', type: 'currency' },
        { key: 'totalValue', label: 'Total Value', type: 'currency' },
        { key: 'location', label: 'Location' },
        { key: 'vendor', label: 'Supplier' },
        { key: 'lastOrdered', label: 'Last Ordered', type: 'date' }
      ]
    };
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
      let reportData;

      switch (state.reportType) {
        case 'task-completion-log':
          reportData = await generateTaskCompletionReport();
          break;
        case 'inventory-levels':
          reportData = await generateInventoryReport();
          break;
        default:
          throw new Error(`Report type ${state.reportType} not implemented yet`);
      }

      const generatedReport: GeneratedReport = {
        ...reportData,
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
        description: `${reportData.title} has been generated successfully.`
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
      
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
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
