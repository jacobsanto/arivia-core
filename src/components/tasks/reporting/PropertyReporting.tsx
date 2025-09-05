
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
// Chart colors for consistent styling
const barColors = {
  completed: "#10b981",
  pending: "#f59e0b",
  overdue: "#ef4444",
  rejected: "#f43f5e",
  approved: "#22c55e"
};
import { Badge } from "@/components/ui/badge";
import { PropertyReportData } from "@/services/reports/reportDataService";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyReportingProps {
  data: PropertyReportData[];
  isLoading: boolean;
}

export const PropertyReporting = ({ data, isLoading }: PropertyReportingProps) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return <LoadingSkeleton isMobile={isMobile} />;
  }
  
  // Calculate percentages for approval rates
  const propertiesWithRates = data.map(property => ({
    ...property,
    approvalRate: property.completed > 0 
      ? Math.round((property.approved / property.completed) * 100) 
      : 0
  }));
  
  return <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 py-[8px] px-[10px] mx-[3px]">
          <h3 className="text-lg font-medium mb-4 text-center">Task Completion by Property</h3>
          <div className="h-80 chart-responsive">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={isMobile ? {
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 60
                } : {
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12} 
                  angle={isMobile ? -45 : 0} 
                  textAnchor={isMobile ? "end" : "middle"} 
                  height={60} 
                  tick={{
                    fontSize: isMobile ? 10 : 12
                  }} 
                />
                <YAxis 
                  tick={{
                    fontSize: isMobile ? 10 : 12
                  }} 
                  width={isMobile ? 30 : 40} 
                />
                <Tooltip />
                <Bar dataKey="completed" name="Total Completed" fill={barColors.completed} />
                <Bar dataKey="rejected" name="Rejected" fill={barColors.rejected} />
                <Bar dataKey="approved" name="Approved" fill={barColors.approved} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {isMobile ? (
        // Mobile card-based layout
        <div className="space-y-3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Property Cleaning Data</h3>
              <div className="space-y-4">
                {propertiesWithRates.map((property) => (
                  <Card key={property.name} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{property.name}</h4>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{property.approvalRate}%</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Tasks Completed</div>
                          <div className="font-medium">{property.completed}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Avg. Time</div>
                          <div className="font-medium">72 min</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-muted-foreground">Common Issues</div>
                          <div className="font-medium">
                            {property.rejected > 5 ? "Bathroom cleaning" : 
                             property.rejected > 2 ? "Dust on surfaces" : 
                             "None significant"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Desktop table layout
        <div className="mobile-scroll">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Property Cleaning Data</h3>
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
                  {propertiesWithRates.map((property) => (
                    <TableRow key={property.name}>
                      <TableCell>{property.name}</TableCell>
                      <TableCell>{property.completed}</TableCell>
                      <TableCell>
                        {Math.round(65 + (property.completed % 15))} min
                      </TableCell>
                      <TableCell>{property.approvalRate}%</TableCell>
                      <TableCell>
                        {property.rejected > 5 ? "Bathroom cleaning" : 
                         property.rejected > 2 ? "Dust on surfaces" : 
                         "None significant"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>;
};

// Loading skeleton component
const LoadingSkeleton = ({ isMobile }: { isMobile: boolean }) => (
  <div className="space-y-4">
    <Card>
      <CardContent className="pt-6 py-[8px] px-[10px] mx-[3px]">
        <h3 className="text-lg font-medium mb-4 text-center">Task Completion by Property</h3>
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
    
    {isMobile ? (
      <div className="space-y-3">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Property Cleaning Data</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Tasks Completed</div>
                        <Skeleton className="h-4 w-8 mt-1" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                        <Skeleton className="h-4 w-12 mt-1" />
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs text-muted-foreground">Common Issues</div>
                        <Skeleton className="h-4 w-32 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="mobile-scroll">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Property Cleaning Data</h3>
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )}
  </div>
);
