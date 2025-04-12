
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PerformanceMetricsChart } from '@/components/analytics/PerformanceMetricsChart';
import { MetricSummary } from '@/components/analytics/MetricSummary';
import { useIsMobile } from "@/hooks/use-mobile";
import { Calendar, Users, Home, Clock } from "lucide-react";

// Sample data
const monthlyOccupancyData = [
  { name: 'Jan', occupancy: 75, bookings: 24 },
  { name: 'Feb', occupancy: 82, bookings: 28 },
  { name: 'Mar', occupancy: 68, bookings: 22 },
  { name: 'Apr', occupancy: 79, bookings: 26 },
  { name: 'May', occupancy: 85, bookings: 30 },
  { name: 'Jun', occupancy: 95, bookings: 32 },
  { name: 'Jul', occupancy: 98, bookings: 35 },
  { name: 'Aug', occupancy: 97, bookings: 34 },
  { name: 'Sep', occupancy: 88, bookings: 30 },
  { name: 'Oct', occupancy: 81, bookings: 28 },
  { name: 'Nov', occupancy: 76, bookings: 25 },
  { name: 'Dec', occupancy: 90, bookings: 31 }
];

const propertyOccupancyData = [
  { name: 'Villa Caldera', occupancy: 87, avgStay: 5.2 },
  { name: 'Villa Sunset', occupancy: 82, avgStay: 4.8 },
  { name: 'Villa Oceana', occupancy: 91, avgStay: 6.5 },
  { name: 'Villa Paradiso', occupancy: 78, avgStay: 4.3 },
  { name: 'Villa Azure', occupancy: 86, avgStay: 5.7 }
];

const seasonalData = [
  { name: 'Winter', occupancy: 76, bookings: 65, avgRate: 320 },
  { name: 'Spring', occupancy: 82, bookings: 78, avgRate: 380 },
  { name: 'Summer', occupancy: 96, bookings: 105, avgRate: 520 },
  { name: 'Fall', occupancy: 85, bookings: 87, avgRate: 420 }
];

export const OccupancyAnalysis: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Occupancy Analysis</CardTitle>
              <CardDescription>Detailed insights into property occupancy patterns</CardDescription>
            </div>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="p-6 pt-2">
            <TabsList className="mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>By Property</span>
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Seasonal</span>
              </TabsTrigger>
              <TabsTrigger value="stay-length" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Stay Length</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                <MetricSummary 
                  title="Average Occupancy"
                  value="84.5%"
                  change={{ value: 3.2, isPositive: true }}
                  variant="accent"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Total Bookings"
                  value="345"
                  change={{ value: 8, isPositive: true }}
                  variant="success"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Peak Season"
                  value="Summer"
                  description="96% occupancy"
                  variant="info"
                  size={isMobile ? "sm" : "md"}
                />
                <MetricSummary 
                  title="Avg. Stay Length"
                  value="5.3 days"
                  change={{ value: 0.4, isPositive: true }}
                  variant="warning"
                  size={isMobile ? "sm" : "md"}
                />
              </div>
              
              <PerformanceMetricsChart 
                title="Monthly Occupancy Rate" 
                description="Occupancy percentage throughout the year"
                type="line"
                data={monthlyOccupancyData}
                dataKeys={[
                  { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
                ]}
              />
              
              <PerformanceMetricsChart 
                title="Monthly Bookings" 
                description="Number of bookings per month"
                type="bar"
                data={monthlyOccupancyData}
                dataKeys={[
                  { key: "bookings", name: "Bookings", color: "#8b5cf6" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="properties" className="space-y-6">
              <PerformanceMetricsChart 
                title="Occupancy by Property" 
                description="Average occupancy percentage for each property"
                type="bar"
                data={propertyOccupancyData}
                dataKeys={[
                  { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="seasonal" className="space-y-6">
              <PerformanceMetricsChart 
                title="Seasonal Analysis" 
                description="Occupancy and average rate by season"
                type="multi-line"
                data={seasonalData}
                dataKeys={[
                  { key: "occupancy", name: "Occupancy (%)", color: "#0ea5e9" },
                  { key: "avgRate", name: "Avg. Rate (€)", color: "#f97316" }
                ]}
              />
            </TabsContent>
            
            <TabsContent value="stay-length" className="space-y-6">
              <PerformanceMetricsChart 
                title="Average Stay Length" 
                description="Average stay duration in days by property"
                type="bar"
                data={propertyOccupancyData}
                dataKeys={[
                  { key: "avgStay", name: "Avg. Stay (Days)", color: "#ec4899" }
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
