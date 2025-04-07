import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
interface BookingTrendsChartProps {
  data: Array<{
    month: string;
    bookings: number;
  }>;
}
const BookingTrendsChart: React.FC<BookingTrendsChartProps> = ({
  data
}) => {
  return <Card>
      
      
    </Card>;
};
export default BookingTrendsChart;