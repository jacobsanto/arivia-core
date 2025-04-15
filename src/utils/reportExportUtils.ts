
/**
 * Exports data to CSV format
 */
export const exportToCSV = (data: any[], filename: string) => {
  // Convert data to CSV format
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const csvContent = [
    headers.join(','), // CSV header row
    ...data.map(row => headers.map(header => {
      // Handle string values that contain commas by wrapping in quotes
      const value = row[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    }).join(','))
  ].join('\n');
  
  // Create a CSV file and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prepares data for printing
 */
export const preparePrint = (data: any[], title: string) => {
  // Create a printable version of the data
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  // Generate HTML content
  let htmlContent = `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <table>
        <thead>
          <tr>
  `;
  
  // Add table headers
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
  }
  
  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;
  
  // Add table rows
  data.forEach(row => {
    htmlContent += '<tr>';
    Object.values(row).forEach(value => {
      htmlContent += `<td>${value}</td>`;
    });
    htmlContent += '</tr>';
  });
  
  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Trigger print after the content has loaded
  printWindow.onload = () => {
    printWindow.print();
  };
};
