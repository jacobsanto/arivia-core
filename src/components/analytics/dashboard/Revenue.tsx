
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface RevenueProps {
  propertyFilter?: string;
}

export const Revenue: React.FC<RevenueProps> = ({ propertyFilter = "all" }) => {
  // Placeholder data - in real app would come from your API
  const revenueData = [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 }
  ];
  
  // Empty state demo
  const isEmpty = true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Monthly revenue for {propertyFilter === "all" ? "all properties" : propertyFilter}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No revenue data</AlertTitle>
            <AlertDescription>
              Revenue data will appear here when financial records are added to the database.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
