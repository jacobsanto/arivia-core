
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfitabilityComparisonProps {
  propertyComparisonData: any[];
}

export const ProfitabilityComparison: React.FC<ProfitabilityComparisonProps> = ({ 
  propertyComparisonData 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profitability by Property</CardTitle>
        <CardDescription>Revenue and expenses comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {propertyComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={propertyComparisonData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  height={40}
                  tickMargin={5}
                  interval={0}
                  textAnchor="middle"
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(label) => `Property: ${label}`}
                />
                {!isMobile && <Legend />}
                <Bar dataKey="revenue" name="Revenue" fill="#4CAF50" />
                <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                <Bar dataKey="profit" name="Profit" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>No profitability data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
