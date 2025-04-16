
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

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
