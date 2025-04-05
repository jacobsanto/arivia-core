
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const completionData = [
  { name: 'Villa Caldera', completed: 45, rejected: 2, approved: 41 },
  { name: 'Villa Sunset', completed: 36, rejected: 4, approved: 32 },
  { name: 'Villa Oceana', completed: 52, rejected: 1, approved: 51 },
  { name: 'Villa Paradiso', completed: 28, rejected: 5, approved: 23 },
  { name: 'Villa Azure', completed: 39, rejected: 3, approved: 36 }
];

const staffData = [
  { name: 'Maria K.', completed: 42, avgTime: 68, rating: 4.8 },
  { name: 'Stefan M.', completed: 35, avgTime: 72, rating: 4.7 },
  { name: 'Ana R.', completed: 48, avgTime: 65, rating: 4.9 },
  { name: 'Thomas L.', completed: 31, avgTime: 75, rating: 4.6 },
  { name: 'Julia P.', completed: 39, avgTime: 70, rating: 4.7 }
];

const performanceByDayData = [
  { name: 'Mon', tasks: 15, avgTime: 72 },
  { name: 'Tue', tasks: 12, avgTime: 68 },
  { name: 'Wed', tasks: 18, avgTime: 71 },
  { name: 'Thu', tasks: 16, avgTime: 69 },
  { name: 'Fri', tasks: 22, avgTime: 73 },
  { name: 'Sat', tasks: 28, avgTime: 78 },
  { name: 'Sun', tasks: 24, avgTime: 75 }
];

const barColors = {
  completed: '#94a3b8',
  rejected: '#f87171',
  approved: '#4ade80'
};

const TaskReporting = () => {
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-muted-foreground">
          View historical data on housekeeping tasks and staff performance.
        </p>
        <div className="space-x-2">
          <select 
            className="border rounded p-1 text-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      <Tabs defaultValue="properties">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Task Completion by Property</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} angle={isMobile ? -45 : 0} textAnchor={isMobile ? "end" : "middle"} height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" name="Total Completed" fill={barColors.completed} />
                    <Bar dataKey="rejected" name="Rejected" fill={barColors.rejected} />
                    <Bar dataKey="approved" name="Approved" fill={barColors.approved} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Property Cleaning Data</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Avg. Cleaning Time</TableHead>
                      <TableHead>Approval Rate</TableHead>
                      <TableHead>Common Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Villa Caldera</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>72 min</TableCell>
                      <TableCell>91%</TableCell>
                      <TableCell>Bathroom cleaning</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Villa Sunset</TableCell>
                      <TableCell>36</TableCell>
                      <TableCell>68 min</TableCell>
                      <TableCell>89%</TableCell>
                      <TableCell>Dust on surfaces</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Villa Oceana</TableCell>
                      <TableCell>52</TableCell>
                      <TableCell>65 min</TableCell>
                      <TableCell>98%</TableCell>
                      <TableCell>None significant</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Staff Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={staffData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" name="Tasks Completed" fill="#3b82f6">
                      {staffData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rating >= 4.8 ? '#4ade80' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Staff Performance Details</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Avg. Cleaning Time</TableHead>
                      <TableHead>Quality Rating</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.map((staff) => (
                      <TableRow key={staff.name}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.completed}</TableCell>
                        <TableCell>{staff.avgTime} min</TableCell>
                        <TableCell>
                          <span className={`font-medium ${staff.rating >= 4.8 ? 'text-green-600' : staff.rating >= 4.6 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {staff.rating}/5.0
                          </span>
                        </TableCell>
                        <TableCell>
                          {staff.rating >= 4.8 
                            ? "Excellent attention to detail" 
                            : staff.rating >= 4.6 
                            ? "Good overall performance"
                            : "Needs improvement in thoroughness"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="time" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskReporting;
