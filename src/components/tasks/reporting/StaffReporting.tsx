
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
import { staffData } from "./reportingData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

export const StaffReporting = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Staff Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={staffData}
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 0 : 20, 
                  bottom: isMobile ? 40 : 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 30}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
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
      
      {isMobile ? (
        // Mobile card view
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Staff Performance Details</h3>
            <div className="space-y-3">
              {staffData.map((staff) => (
                <Card key={staff.name} className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{staff.name}</h4>
                      <Badge 
                        className={
                          staff.rating >= 4.8 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : staff.rating >= 4.6 
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }
                      >
                        {staff.rating}/5.0
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Tasks Completed</div>
                        <div className="font-medium">{staff.completed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                        <div className="font-medium">{staff.avgTime} min</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Feedback</div>
                        <div className="font-medium">
                          {staff.rating >= 4.8 
                            ? "Excellent attention to detail" 
                            : staff.rating >= 4.6 
                            ? "Good overall performance"
                            : "Needs improvement in thoroughness"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Desktop table view
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
      )}
    </div>
  );
};
