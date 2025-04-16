
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpenseCategoriesProps {
  expenseCategoriesData: any[];
  propertyName: string;
}

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = ({ 
  expenseCategoriesData,
  propertyName
}) => {
  const isAllProperties = propertyName === 'all';
  
  // Colors for pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          {isAllProperties 
            ? 'Expense distribution across all properties' 
            : `Expense distribution for ${propertyName}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {expenseCategoriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {expenseCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>No expense data available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
