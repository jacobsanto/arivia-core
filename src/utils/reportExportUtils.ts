import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { GeneratedReport } from '@/types/reports.types';

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }
  
  try {
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Generate CSV and trigger download
    const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Export report to CSV format
 */
export const exportReportToCSV = (report: GeneratedReport) => {
  const filename = report.title.toLowerCase().replace(/\s+/g, '-');
  exportToCSV(report.data, filename);
};

/**
 * Export report to PDF format
 */
export const exportReportToPDF = (report: GeneratedReport) => {
  if (!report.data || !report.data.length) {
    console.warn('No data to export');
    return;
  }

  try {
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.warn('Could not open print window. Check if pop-ups are blocked.');
      return;
    }

    // Format date range if available
    const dateRangeText = report.dateRange 
      ? `Date Range: ${report.dateRange.startDate} to ${report.dateRange.endDate}`
      : '';

    // Format filters if available
    const filtersText = report.filters && Object.keys(report.filters).length > 0
      ? `Filters: ${Object.entries(report.filters)
          .filter(([_, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')}`
      : '';

    // Create table headers
    const headers = report.columns.map(col => col.label);
    
    // Format data based on column types
    const formatCellValue = (value: any, type?: string) => {
      if (value === null || value === undefined) return '';
      
      switch (type) {
        case 'currency':
          return typeof value === 'number' ? `€${value.toFixed(2)}` : value;
        case 'date':
          return value ? new Date(value).toLocaleDateString() : '';
        case 'number':
          return typeof value === 'number' ? value.toLocaleString() : value;
        default:
          return String(value);
      }
    };

    let tableHTML = `
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
            }
            h1 { 
              color: #1e293b;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .meta-info {
              color: #64748b;
              font-size: 14px;
              margin: 5px 0;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 20px;
              font-size: 12px;
            }
            th { 
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 12px 8px;
              text-align: left;
              font-weight: 600;
              color: #374151;
            }
            td { 
              border: 1px solid #e2e8f0; 
              padding: 8px; 
              text-align: left;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.title}</h1>
            <div class="meta-info">Generated: ${report.generatedAt.toLocaleString()}</div>
            ${dateRangeText ? `<div class="meta-info">${dateRangeText}</div>` : ''}
            ${filtersText ? `<div class="meta-info">${filtersText}</div>` : ''}
            <div class="meta-info">Total Records: ${report.data.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${report.data.map(row => `
                <tr>
                  ${report.columns.map(col => 
                    `<td>${formatCellValue(row[col.key], col.type)}</td>`
                  ).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div>Arivia Core - Property Management System</div>
            <div>This report was automatically generated and contains ${report.data.length} records.</div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    
    // Allow time for resources to load, then trigger print dialog
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

/**
 * Prepare report data for printing
 */
export const preparePrint = (data: any[], title: string) => {
  if (!data || !data.length) {
    console.warn('No data to print');
    return;
  }
  
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.warn('Could not open print window. Check if pop-ups are blocked.');
      return;
    }
    
    // Create a simple table for printing
    const headers = Object.keys(data[0]);
    
    let tableHTML = `
      <html>
        <head>
          <title>${title} - Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th { background-color: #f2f2f2; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .date { margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    
    // Allow time for resources to load
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
  } catch (error) {
    console.error('Error preparing for print:', error);
  }
};