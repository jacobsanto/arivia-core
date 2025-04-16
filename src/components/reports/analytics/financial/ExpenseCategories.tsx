
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface ExpenseCategoriesProps {
  expenseCategoriesData: any[];
  propertyName: string;
}

export const ExpenseCategories: React.FC<ExpenseCategoriesProps> = ({ 
  expenseCategoriesData,
  propertyName
}) => {
  const isAllProperties = propertyName === 'all';
  
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
        <div className="h-[300px] flex items-center justify-center">
          {expenseCategoriesData.length > 0 ? (
            <PieChart className="h-36 w-36 text-muted-foreground/30" />
          ) : (
            <div className="text-center text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
              <p>No expense data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
