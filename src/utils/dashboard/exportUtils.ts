import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ExportDataItem {
  [key: string]: any;
}

export const exportToExcel = async (data: ExportDataItem[], filename: string, sheetName: string = 'Sheet1') => {
  const toastId = toast.info('Preparing export...', { 
    description: 'Processing data for export'
  });
  
  try {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate file and download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    toast.success('Export completed successfully', {
      description: `${filename}.xlsx has been downloaded`
    });
  } catch (error) {
    console.error('Export failed:', error);
    toast.error('Export failed', {
      description: 'There was an error exporting the data'
    });
  }
};

export const exportToCSV = async (data: ExportDataItem[], filename: string) => {
  const toastId = toast.info('Preparing CSV export...', {
    description: 'Converting data to CSV format'
  });
  
  try {
    // Convert data to CSV format
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV export completed', {
      description: `${filename}.csv has been downloaded`
    });
  } catch (error) {
    console.error('CSV export failed:', error);
    toast.error('CSV export failed', {
      description: 'There was an error exporting the data'
    });
  }
};

export const exportToPDF = async (data: ExportDataItem[], filename: string, title: string = 'Report') => {
  const toastId = toast.info('Preparing PDF export...', {
    description: 'Generating PDF document'
  });
  
  try {
    // For now, we'll convert to a simple text format
    // In a real implementation, you'd use a PDF library like jsPDF
    const content = `${title}\n\n${JSON.stringify(data, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export completed', {
      description: `${filename}.txt has been downloaded`
    });
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error('Export failed', {
      description: 'There was an error exporting the data'
    });
  }
};

export const exportDashboardData = async (
  data: any,
  format: 'csv' | 'excel' | 'pdf' = 'csv',
  filename: string = 'dashboard-export'
) => {
  try {
    switch (format) {
      case 'csv':
        await exportToCSV(data, filename);
        break;
      case 'excel':
        await exportToExcel(data, filename);
        break;
      case 'pdf':
        await exportToPDF(data, filename);
        break;
      default:
        await exportToCSV(data, filename);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
