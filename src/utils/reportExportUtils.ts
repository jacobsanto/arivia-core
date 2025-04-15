
/**
 * Exports data to CSV format
 */
export const exportToCSV = (data: any[], filename: string) => {
  // If data is not array or is empty, return
  if (!Array.isArray(data) || !data.length) {
    console.warn('No data to export');
    return;
  }
  
  try {
    // Handle data structured as object with section arrays
    let csvContent = '';
    let flatData = data;
    
    // If first element is not an object with keys, try to flatten
    if (typeof data[0] !== 'object' || data[0] === null) {
      flatData = [data.map(item => ({ value: item }))];
    }
    
    // Handle data sections (if data is an object with arrays)
    if (Object.keys(data).length > 0 && !Array.isArray(data[0])) {
      let isFirstSection = true;
      
      // Process each section
      for (const [section, items] of Object.entries(data)) {
        if (!Array.isArray(items) || !items.length) continue;
        
        // Add section header
        if (!isFirstSection) {
          csvContent += '\n\n';
        }
        csvContent += `${section.toUpperCase()}\n`;
        
        // Get headers from first item
        const headers = Object.keys(items[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add items
        items.forEach(item => {
          const values = headers.map(header => {
            const value = item[header];
            // Handle special values
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            return value;
          });
          csvContent += values.join(',') + '\n';
        });
        
        isFirstSection = false;
      }
    } else {
      // Standard array of objects processing
      // Get headers from first item
      const headers = Object.keys(flatData[0]);
      csvContent = headers.join(',') + '\n';
      
      // Add rows
      flatData.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];
          // Handle special values
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return value;
        }).join(',');
        csvContent += row + '\n';
      });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Prepares data for printing
 */
export const preparePrint = (data: any[], title: string) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }
  
  try {
    // Generate HTML content
    let htmlContent = `
      <html>
      <head>
          <title>${title}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #555; margin-top: 20px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .print-date { color: #777; font-size: 12px; margin-bottom: 20px; }
              @media print {
                  button { display: none; }
              }
          </style>
      </head>
      <body>
          <button onclick="window.print()">Print</button>
          <button onclick="window.close()">Close</button>
          <h1>${title}</h1>
          <div class="print-date">Generated on ${new Date().toLocaleString()}</div>
    `;
    
    // Handle data structured as object with section arrays
    if (Object.keys(data).length > 0 && !Array.isArray(data[0])) {
      // Process each section
      for (const [section, items] of Object.entries(data)) {
        if (!Array.isArray(items) || !items.length) continue;
        
        // Add section header
        htmlContent += `<h2>${section.toUpperCase()}</h2>`;
        
        // Generate table
        htmlContent += '<table><thead><tr>';
        
        // Add headers
        const headers = Object.keys(items[0]);
        headers.forEach(header => {
          htmlContent += `<th>${header}</th>`;
        });
        htmlContent += '</tr></thead><tbody>';
        
        // Add rows
        items.forEach(item => {
          htmlContent += '<tr>';
          headers.forEach(header => {
            const value = item[header];
            htmlContent += `<td>${value !== undefined && value !== null ? value : ''}</td>`;
          });
          htmlContent += '</tr>';
        });
        
        htmlContent += '</tbody></table>';
      }
    } else if (Array.isArray(data) && data.length > 0) {
      // Standard array of objects
      htmlContent += '<table><thead><tr>';
      
      // Add headers
      const headers = Object.keys(data[0]);
      headers.forEach(header => {
        htmlContent += `<th>${header}</th>`;
      });
      htmlContent += '</tr></thead><tbody>';
      
      // Add rows
      data.forEach(item => {
        htmlContent += '<tr>';
        headers.forEach(header => {
          const value = item[header];
          htmlContent += `<td>${value !== undefined && value !== null ? value : ''}</td>`;
        });
        htmlContent += '</tr>';
      });
      
      htmlContent += '</tbody></table>';
    }
    
    htmlContent += '</body></html>';
    
    // Write to the new window
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error preparing print:', error);
    printWindow.close();
  }
};
