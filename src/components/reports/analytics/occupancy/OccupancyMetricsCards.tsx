
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, CalendarDays, Percent, Users } from "lucide-react";

interface OccupancyMetricsCardsProps {
  occupancyData: any[];
}

export const OccupancyMetricsCards: React.FC<OccupancyMetricsCardsProps> = ({ occupancyData }) => {
  const isEmpty = !occupancyData || occupancyData.length === 0;
  
  // Calculate metrics only if we have data
  const avgOccupancy = isEmpty ? 0 : 
    Math.round(occupancyData.reduce((sum, item) => sum + item.occupancy_rate, 0) / occupancyData.length);
    
  const totalBookings = isEmpty ? 0 :
    occupancyData.reduce((sum, item) => sum + item.bookings, 0);
    
  const totalRevenue = isEmpty ? 0 :
    occupancyData.reduce((sum, item) => sum + item.revenue, 0);
    
  const avgStay = isEmpty ? 0 :
    occupancyData.reduce((sum, item) => sum + (item.average_stay || 0), 0) / occupancyData.length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgOccupancy}%</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBookings}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Booking Revenue</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgStay.toFixed(1)} nights</div>
          <p className="text-xs text-muted-foreground">
            For the selected period
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
