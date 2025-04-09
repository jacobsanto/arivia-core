
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell } from "recharts";

const MobileAnalyticsDashboard = () => {
  // Mock data for charts
  const barData = [
    { name: 'Mon', value: 24 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 27 },
    { name: 'Thu', value: 32 },
    { name: 'Fri', value: 28 },
    { name: 'Sat', value: 38 },
    { name: 'Sun', value: 36 }
  ];
  
  const pieData = [
    { name: 'Villa Caldera', value: 45 },
    { name: 'Villa Azure', value: 35 },
    { name: 'Villa Sunset', value: 20 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">87%</div>
              <div className="text-xs text-muted-foreground">Occupancy Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">€24,580</div>
              <div className="text-xs text-muted-foreground">Monthly Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Tasks Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
            Weekly Tasks Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Property Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-36 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* View More Button */}
      <Button variant="outline" className="w-full">
        View Detailed Analytics
      </Button>
    </div>
  );
};

export default MobileAnalyticsDashboard;
