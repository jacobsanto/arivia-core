
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface BookingsChartProps {
  chartData: any[];
  propertyName: string;
}

export const BookingsChart: React.FC<BookingsChartProps> = ({ 
  chartData, 
  propertyName 
}) => {
  const isEmpty = !chartData || chartData.length === 0;
  
  const title = propertyName === 'all' ? 
    'Bookings Overview' : 
    `${propertyName} Bookings`;
    
  const description = propertyName === 'all' ? 
    'Monthly bookings and revenue across all properties' : 
    `Monthly bookings and revenue for ${propertyName}`;
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No booking data available</AlertTitle>
            <AlertDescription>
              Booking data will appear here once it's recorded. Please select a different time period or add booking records.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
