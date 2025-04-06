
import { format } from 'date-fns';

/**
 * Generates and downloads a CSV file from report data
 * @param data Array of data to convert to CSV
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  // Convert data to CSV format
  const headers = Object.keys(data[0]);
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        // Handle special formatting for values
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Escape commas and quotes
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Add date suffix to filename
  const dateSuffix = format(new Date(), 'yyyy-MM-dd');
  const fullFilename = `${filename}_${dateSuffix}.csv`;
  
  // Set up and trigger download
  link.href = url;
  link.setAttribute('download', fullFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prepare data for printing
 * @param data Data to be printed
 * @param title Title of the report
 */
export const preparePrint = (data: any[], title: string): void => {
  // Create a print-friendly version
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Unable to open print window');
    return;
  }
  
  // Generate HTML for the print window
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #1a1f2c;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #f6f6f7;
          text-align: left;
          padding: 10px;
          border-bottom: 2px solid #ddd;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          text-align: center;
          color: #888;
        }
        .date {
          margin-top: 5px;
          font-size: 14px;
          color: #555;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date">Generated on ${format(new Date(), 'PPPP')}</div>
      <table>
        <thead>
          <tr>
            ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        Generated using Arivia Reports System
      </div>
      <script>
        // Automatically print when the page loads
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;
  
  // Write the HTML to the print window and trigger printing
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Format report data for consistent display
 * @param data Raw report data
 * @param options Formatting options
 */
export const formatReportData = (data: any[], options: {
  dateFormat?: string;
  numberFormat?: Intl.NumberFormatOptions;
} = {}): any[] => {
  if (!data || !data.length) {
    return [];
  }
  
  const { dateFormat = 'MMM d, yyyy', numberFormat = {} } = options;
  
  return data.map(item => {
    const formattedItem: Record<string, any> = {};
    
    // Format each property based on its type
    Object.entries(item).forEach(([key, value]) => {
      if (value instanceof Date) {
        formattedItem[key] = format(value, dateFormat);
      } else if (typeof value === 'number') {
        formattedItem[key] = new Intl.NumberFormat('en-US', numberFormat).format(value);
      } else {
        formattedItem[key] = value;
      }
    });
    
    return formattedItem;
  });
};
