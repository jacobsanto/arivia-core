
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ExpenseCategoriesProps {
  expenseCategoriesData: any[];
  propertyName: string;
}

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = ({ 
  expenseCategoriesData, 
  propertyName 
}) => {
  const isEmpty = !expenseCategoriesData || expenseCategoriesData.length === 0;
  const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
  
  const title = propertyName === 'all' ? 
    'Expense Categories' : 
    `${propertyName} Expense Categories`;
    
  const description = propertyName === 'all' ? 
    'Breakdown of expenses by category across all properties' : 
    `Breakdown of expenses by category for ${propertyName}`;
    
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
            <AlertTitle>No expense category data</AlertTitle>
            <AlertDescription>
              Expense category breakdown will appear here once financial data is recorded.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[300px]">
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
                >
                  {expenseCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
