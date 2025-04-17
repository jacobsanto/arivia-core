
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ProfitabilityComparisonProps {
  propertyComparisonData: any[];
}

export const ProfitabilityComparison: React.FC<ProfitabilityComparisonProps> = ({ 
  propertyComparisonData 
}) => {
  const isEmpty = !propertyComparisonData || propertyComparisonData.length === 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Profitability</CardTitle>
        <CardDescription>
          Comparison of profit by property
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <Alert className="bg-muted/50">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No profitability data</AlertTitle>
            <AlertDescription>
              Property profitability comparison will appear here once financial data is recorded.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={propertyComparisonData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => `€${value}`} />
                <Bar dataKey="profit" fill="#3b82f6">
                  <LabelList dataKey="profit" position="right" formatter={(value) => `€${value}`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
