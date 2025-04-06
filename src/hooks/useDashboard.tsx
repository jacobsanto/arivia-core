
import { useState, useEffect } from 'react';
import { getDashboardData } from "@/utils/dashboardDataUtils";

export const useDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [date, setDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  useEffect(() => {
    // Fetch dashboard data based on selected property and date
    const data = getDashboardData(selectedProperty);
    setDashboardData(data);
  }, [selectedProperty, date]);
  
  const handlePropertyChange = (property: string) => {
    setSelectedProperty(property);
  };
  
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };
  
  return {
    selectedProperty,
    date,
    dashboardData,
    handlePropertyChange,
    handleDateChange
  };
};
