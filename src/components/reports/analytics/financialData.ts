
// Sample data for financial reports
export const revenueByPropertyData = [
  { property: "Villa Caldera", january: 18500, february: 19800, march: 21200, april: 22500, may: 24000, june: 26500, total: 132500 },
  { property: "Villa Sunset", january: 22000, february: 23500, march: 25000, april: 26800, may: 28500, june: 30200, total: 156000 },
  { property: "Villa Oceana", january: 25500, february: 26800, march: 28200, april: 30500, may: 32000, june: 34500, total: 177500 },
  { property: "Villa Paradiso", january: 28000, february: 29500, march: 31000, april: 33500, may: 35800, june: 38200, total: 196000 },
  { property: "Villa Azure", january: 20500, february: 21800, march: 23500, april: 25200, may: 27000, june: 29500, total: 147500 },
];

export const expenseAnalysisData = [
  { property: "Villa Caldera", maintenance: 5200, utilities: 3800, staff: 8500, supplies: 2200, marketing: 1800, total: 21500 },
  { property: "Villa Sunset", maintenance: 6500, utilities: 4200, staff: 9800, supplies: 2800, marketing: 2200, total: 25500 },
  { property: "Villa Oceana", maintenance: 7200, utilities: 4800, staff: 10500, supplies: 3200, marketing: 2600, total: 28300 },
  { property: "Villa Paradiso", maintenance: 8500, utilities: 5200, staff: 12000, supplies: 3800, marketing: 3200, total: 32700 },
  { property: "Villa Azure", maintenance: 5800, utilities: 4000, staff: 9200, supplies: 2500, marketing: 2000, total: 23500 },
];

export const profitLossData = [
  { property: "Villa Caldera", revenue: 132500, expenses: 21500, profit: 111000, margin: "83.8%" },
  { property: "Villa Sunset", revenue: 156000, expenses: 25500, profit: 130500, margin: "83.7%" },
  { property: "Villa Oceana", revenue: 177500, expenses: 28300, profit: 149200, margin: "84.1%" },
  { property: "Villa Paradiso", revenue: 196000, expenses: 32700, profit: 163300, margin: "83.3%" },
  { property: "Villa Azure", revenue: 147500, expenses: 23500, profit: 124000, margin: "84.1%" },
];

// Format data for display in reports
export const formatFinancialReportData = (data: any[], property: string = "all") => {
  if (property === "all") {
    return data;
  }
  
  // Filter data for specific property
  return data.filter(item => item.property === property);
};
