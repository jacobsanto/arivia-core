
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
  ResponsiveContainer
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { completionData, barColors } from "./reportingData";

export const PropertyReporting = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
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
    </div>
  );
};
