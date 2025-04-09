import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  Tooltip
} from "recharts";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Filter,
  Download,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DateRange } from "@/components/reports/DateRangeSelector";

const MobileAnalyticsView = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined
  });
  
  const [activeSection, setActiveSection] = useState<'overview' | 'financial' | 'operational' | 'occupancy'>('overview');
  
  const revenueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Apr', value: 24000 },
    { name: 'May', value: 28000 },
    { name: 'Jun', value: 32000 },
  ];
  
  const occupancyData = [
    { name: 'Villa Caldera', value: 45 },
    { name: 'Villa Azure', value: 35 },
    { name: 'Villa Sunset', value: 20 }
  ];
  
  const taskCompletionData = [
    { name: 'Mon', value: 24 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 27 },
    { name: 'Thu', value: 32 },
    { name: 'Fri', value: 28 },
    { name: 'Sat', value: 38 },
    { name: 'Sun', value: 36 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col space-y-3">
        <h1 className="text-2xl font-bold tracking-tight flex items-center">
          <BarChart className="mr-2 h-6 w-6" /> Analytics
        </h1>
        
        <DatePickerWithRange 
          value={dateRange} 
          onChange={(newRange) => setDateRange(newRange || { from: undefined, to: undefined })}
        />
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-2 w-max">
          <Button 
            size="sm" 
            variant={activeSection === 'overview' ? "default" : "outline"} 
            onClick={() => setActiveSection('overview')}
            className="flex-shrink-0"
          >
            Overview
          </Button>
          <Button 
            size="sm" 
            variant={activeSection === 'financial' ? "default" : "outline"} 
            onClick={() => setActiveSection('financial')}
            className="flex-shrink-0"
          >
            Financial
          </Button>
          <Button 
            size="sm" 
            variant={activeSection === 'operational' ? "default" : "outline"} 
            onClick={() => setActiveSection('operational')}
            className="flex-shrink-0"
          >
            Operational
          </Button>
          <Button 
            size="sm" 
            variant={activeSection === 'occupancy' ? "default" : "outline"} 
            onClick={() => setActiveSection('occupancy')}
            className="flex-shrink-0"
          >
            Occupancy
          </Button>
        </div>
      </ScrollArea>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">87%</div>
              <div className="text-xs text-muted-foreground">Occupancy Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <DollarSign className="h-6 w-6 text-green-500 mb-2" />
            <div className="text-center">
              <div className="text-xl font-bold">€24,580</div>
              <div className="text-xs text-muted-foreground">Revenue</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {activeSection === 'overview' && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                      formatter={(value) => [`€${value}`, 'Revenue']}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Occupancy Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                      formatter={(value) => [`${value}%`, 'Occupancy']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-xs mt-2 flex-wrap">
                {occupancyData.map((entry, index) => (
                  <div key={index} className="flex items-center mr-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                Weekly Tasks Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskCompletionData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                    <Tooltip 
                      contentStyle={{ fontSize: '12px', padding: '8px' }}
                      formatter={(value) => [`${value}`, 'Tasks']}
                    />
                    <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {activeSection === 'financial' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-700">Total Revenue</div>
                  <div className="text-2xl font-bold">€147,890</div>
                  <div className="text-xs text-blue-600">+12% from last period</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-700">Net Profit</div>
                  <div className="text-2xl font-bold">€57,340</div>
                  <div className="text-xs text-green-600">+8% from last period</div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-amber-700">Expenses</div>
                  <div className="text-2xl font-bold">€90,550</div>
                  <div className="text-xs text-amber-600">+15% from last period</div>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Financial Report
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Property Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <div className="divide-y">
                <div className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Villa Caldera</h3>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">+23%</Badge>
                      €43,250 revenue
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Villa Azure</h3>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">+15%</Badge>
                      €38,750 revenue
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Villa Sunset</h3>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 mr-2">+2%</Badge>
                      €32,150 revenue
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
};

export default MobileAnalyticsView;
