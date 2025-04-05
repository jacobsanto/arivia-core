
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { performanceByDayData } from "./reportingData";

export const TimeAnalysis = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Cleaning Performance by Day</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceByDayData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
              <h4 className="text-lg font-semibold text-blue-700">71 min</h4>
              <p className="text-sm text-blue-600">Average cleaning time</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-green-700">42 min</h4>
              <p className="text-sm text-green-600">Fastest cleaning time</p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-amber-700">112 min</h4>
              <p className="text-sm text-amber-600">Longest cleaning time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
