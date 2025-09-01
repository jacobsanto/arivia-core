import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Building2, AlertTriangle } from 'lucide-react';
import { PropertyInsight, TaskPriorityData } from '@/types/analytics.types';

interface PropertyInsightsChartsProps {
  propertyData: PropertyInsight[];
  priorityData: TaskPriorityData[];
  loading: boolean;
}

export const PropertyInsightsCharts: React.FC<PropertyInsightsChartsProps> = ({ 
  propertyData, 
  priorityData, 
  loading 
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            Loading property insights...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Property Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Costs by Property */}
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Costs by Property
            </h4>
            {propertyData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                No property cost data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={propertyData}
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `€${value}`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="propertyName" 
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => [`€${value.toFixed(2)}`, 'Total Costs']}
                    labelFormatter={(label) => `Property: ${label}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="totalCosts" 
                    fill="#3b82f6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Open Task Priority */}
          <div>
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Open Task Priority
            </h4>
            {priorityData.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                No open tasks found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ priority, count, percent }) => 
                      `${priority}: ${count} (${(percent || 0).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value} tasks`,
                      props.payload.priority
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};