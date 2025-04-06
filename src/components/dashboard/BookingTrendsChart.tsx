
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BookingTrendsChartProps {
  data: Array<{
    month: string;
    bookings: number;
  }>;
}

const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Trends</CardTitle>
        <CardDescription>Monthly booking statistics</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="bookings"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BookingTrendsChart;
