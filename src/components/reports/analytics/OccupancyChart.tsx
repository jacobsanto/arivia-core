
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface OccupancyChartProps {
  data: any[];
  type: 'monthly' | 'stay' | 'seasonal';
  property?: string;
}

export const OccupancyChart: React.FC<OccupancyChartProps> = ({ data, type, property = 'all' }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">No Data Available</CardTitle>
          <CardDescription>No data available for the selected report</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (type === 'monthly') {
    // Monthly occupancy rate chart
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monthly Occupancy Rates</CardTitle>
          <CardDescription>
            {property === 'all' 
              ? 'Average occupancy rates across all properties' 
              : `Occupancy rates for ${property}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                occupancyRate: {
                  label: "Occupancy Rate (%)",
                  color: "#2563eb"
                },
                bookings: {
                  label: "Bookings",
                  color: "#16a34a"
                }
              }}
            >
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="occupancyRate" stroke="#2563eb" />
                <Line type="monotone" dataKey="bookings" stroke="#16a34a" />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  } else if (type === 'stay') {
    // Average length of stay chart
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Average Length of Stay</CardTitle>
          <CardDescription>
            Average stay duration and total bookings by property
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                averageDays: {
                  label: "Average Days",
                  color: "#8b5cf6"
                },
                totalBookings: {
                  label: "Total Bookings",
                  color: "#f59e0b"
                }
              }}
            >
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="property" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="averageDays" fill="#8b5cf6" />
                <Bar dataKey="totalBookings" fill="#f59e0b" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // Seasonal booking trends
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Seasonal Booking Trends</CardTitle>
          <CardDescription>
            Occupancy rates and revenue by season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                occupancyRate: {
                  label: "Occupancy Rate (%)",
                  color: "#0ea5e9"
                },
                totalRevenue: {
                  label: "Revenue ($)",
                  color: "#ec4899"
                }
              }}
            >
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="occupancyRate" fill="#0ea5e9" />
                <Bar dataKey="totalRevenue" fill="#ec4899" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }
};
