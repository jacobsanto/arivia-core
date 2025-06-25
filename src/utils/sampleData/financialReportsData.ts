
export const createSampleFinancialReports = () => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  return [
    {
      month: currentMonth,
      property: "Villa Caldera",
      listing_id: "villa-caldera-oia-001",
      revenue: 4500,
      expenses: 890,
      profit: 3610,
      margin: "80.2%",
      category: "revenue"
    },
    {
      month: currentMonth,
      property: "Villa Azure",
      listing_id: "villa-azure-mykonos-002",
      revenue: 6800,
      expenses: 1240,
      profit: 5560,
      margin: "81.8%",
      category: "revenue"
    }
  ];
};
