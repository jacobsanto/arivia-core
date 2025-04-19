
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DamageReport } from "@/services/damage/damage.service";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface DamageReportStatsProps {
  reports: DamageReport[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4CAF50'];

const DamageReportStats: React.FC<DamageReportStatsProps> = ({ reports }) => {
  // Create status statistics
  const statusCounts: Record<string, number> = {};
  reports.forEach(report => {
    if (statusCounts[report.status]) {
      statusCounts[report.status]++;
    } else {
      statusCounts[report.status] = 1;
    }
  });

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " "),
    value
  }));

  // Create property statistics
  const propertyCounts: Record<string, number> = {};
  reports.forEach(report => {
    const propId = report.property_id;
    if (propertyCounts[propId]) {
      propertyCounts[propId]++;
    } else {
      propertyCounts[propId] = 1;
    }
  });

  const propertyData = Object.entries(propertyCounts)
    .map(([id, value]) => ({
      name: id.slice(0, 8), // Shortened for display
      value
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 properties

  // Create cost statistics
  const totalEstimatedCost = reports.reduce(
    (sum, report) => sum + (report.estimated_cost || 0),
    0
  );
  
  const totalFinalCost = reports.reduce(
    (sum, report) => sum + (report.final_cost || 0),
    0
  );
  
  const totalCompensation = reports.reduce(
    (sum, report) => sum + (report.compensation_amount || 0),
    0
  );

  // Calculate resolution time statistics
  const resolvedReports = reports.filter(
    report => report.resolution_date && report.status === 'resolved'
  );
  
  let averageResolutionDays = 0;
  if (resolvedReports.length > 0) {
    const totalDays = resolvedReports.reduce((sum, report) => {
      const created = new Date(report.created_at);
      const resolved = new Date(report.resolution_date!);
      const days = Math.floor((resolved.getTime() - created.getTime()) / (1000 * 3600 * 24));
      return sum + days;
    }, 0);
    
    averageResolutionDays = totalDays / resolvedReports.length;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time damage reports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResolutionDays.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average time to resolve reports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Damage Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalFinalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total compensation: ${totalCompensation.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties with Most Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={propertyData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Reports" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DamageReportStats;
