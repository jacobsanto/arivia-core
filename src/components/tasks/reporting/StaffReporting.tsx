
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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

const staffData = [
  { name: 'Maria K.', completed: 42, avgTime: 68, rating: 4.8 },
  { name: 'Stefan M.', completed: 35, avgTime: 72, rating: 4.7 },
  { name: 'Ana R.', completed: 48, avgTime: 65, rating: 4.9 },
  { name: 'Thomas L.', completed: 31, avgTime: 75, rating: 4.6 },
  { name: 'Julia P.', completed: 39, avgTime: 70, rating: 4.7 }
];

export const StaffReporting = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
