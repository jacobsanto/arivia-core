
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyMetricCardProps {
  title: string;
  description: string;
  current: string;
  previous: string;
  change: number;
  isPositive: boolean; // Whether an increase is a positive outcome
}

export const WeeklyMetricCard: React.FC<WeeklyMetricCardProps> = ({
  title,
  description,
  current,
  previous,
  change,
  isPositive
}) => {
  // Calculate metrics change direction
  const getChangeDirection = (change: number) => change >= 0 ? "up" : "down";
  const getChangeClass = (change: number, isPositive: boolean) => 
    getChangeDirection(change) === "up" 
      ? (isPositive ? "text-green-600" : "text-red-600") 
      : (isPositive ? "text-red-600" : "text-green-600");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{current}</p>
            <p className="text-sm text-muted-foreground">Previous: {previous}</p>
          </div>
          <div className={getChangeClass(change, isPositive)}>
            <span className="text-lg font-medium">{Math.abs(change)}%</span>
            <span className="ml-1">{getChangeDirection(change)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
