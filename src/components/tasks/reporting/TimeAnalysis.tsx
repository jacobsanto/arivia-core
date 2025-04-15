
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeAnalysisData } from "@/services/reports/reportDataService";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeAnalysisProps {
  data: TimeAnalysisData[];
  isLoading: boolean;
}

export const TimeAnalysis = ({ data, isLoading }: TimeAnalysisProps) => {
  // Calculate averages for summary cards
  const avgCleaningTime = isLoading ? 0 : data.reduce((sum, item) => sum + item.avgTime, 0) / (data.length || 1);
  const fastestTime = isLoading ? 0 : Math.min(...data.map(item => item.avgTime));
  const longestTime = isLoading ? 0 : Math.max(...data.map(item => item.avgTime));
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 py-[12px] px-0 mx-0">
          <h3 className="text-lg font-medium mb-4 text-center">Cleaning Performance by Day</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="tasks" name="Number of Tasks" fill="#3b82f6" />
                <Bar yAxisId="right" dataKey="avgTime" name="Avg. Minutes" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Time Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-700">{Math.round(avgCleaningTime)} min</h4>
              <p className="text-sm text-blue-600">Average cleaning time</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-green-700">{Math.round(fastestTime)} min</h4>
              <p className="text-sm text-green-600">Fastest cleaning time</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-amber-700">{Math.round(longestTime)} min</h4>
              <p className="text-sm text-amber-600">Longest cleaning time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Card>
      <CardContent className="pt-6 py-[12px] px-0 mx-0">
        <h3 className="text-lg font-medium mb-4 text-center">Cleaning Performance by Day</h3>
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
      
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Time Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Skeleton className="h-6 w-16 bg-blue-200" />
            <p className="text-sm text-blue-600">Average cleaning time</p>
          </div>
            
          <div className="bg-green-50 p-4 rounded-lg">
            <Skeleton className="h-6 w-16 bg-green-200" />
            <p className="text-sm text-green-600">Fastest cleaning time</p>
          </div>
            
          <div className="bg-amber-50 p-4 rounded-lg">
            <Skeleton className="h-6 w-16 bg-amber-200" />
            <p className="text-sm text-amber-600">Longest cleaning time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
