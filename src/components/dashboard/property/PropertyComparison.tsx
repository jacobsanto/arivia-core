import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building, DollarSign, Calendar, TrendingUp, Users, Star } from "lucide-react";
import { subMonths } from "date-fns";

interface PropertyComparison {
  id: string;
  title: string;
  revenue: number;
  occupancy: number;
  adr: number;
  bookings: number;
  rating: number;
  profitMargin: number;
  maintenanceCosts: number;
  averageStay: number;
}

export const PropertyComparison: React.FC = () => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const { data: availableProperties, isLoading: loadingProperties } = useQuery({
    queryKey: ['available-properties'],
    queryFn: async () => {
      const { data } = await supabase.from('guesty_listings').select('id, title').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: comparisonData, isLoading: loadingComparison } = useQuery({
    queryKey: ['property-comparison', selectedProperties],
    queryFn: async () => {
      if (selectedProperties.length < 2) return null;

      const today = new Date();
      const lastMonth = subMonths(today, 1);

      const [bookings, financial, maintenance] = await Promise.all([
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('financial_reports').select('*'),
        supabase.from('maintenance_tasks').select('*')
      ]);

      const comparisons: PropertyComparison[] = [];

      for (const propertyId of selectedProperties) {
        const property = availableProperties?.find(p => p.id === propertyId);
        if (!property) continue;

        const propertyBookings = bookings.data?.filter(b => 
          b.listing_id === propertyId && new Date(b.check_in) >= lastMonth
        ) || [];

        const propertyRevenue = financial.data?.filter(f => 
          f.listing_id === propertyId && new Date(f.check_in || '') >= lastMonth
        ).reduce((sum, f) => sum + (f.revenue || 0), 0) || 0;

        const propertyMaintenance = maintenance.data?.filter(m => 
          m.property_id === propertyId && new Date(m.created_at) >= lastMonth
        ).length || 0;

        const totalStayNights = propertyBookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in);
          const checkOut = new Date(booking.check_out);
          return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        }, 0);

        const occupancy = Math.min(Math.round((propertyBookings.length / 30) * 100), 100);
        const adr = totalStayNights > 0 ? Math.round(propertyRevenue / totalStayNights) : 0;
        const averageStay = propertyBookings.length > 0 ? totalStayNights / propertyBookings.length : 0;
        const maintenanceCosts = propertyMaintenance * 150; // Estimated cost per task
        const profitMargin = propertyRevenue > 0 ? ((propertyRevenue - maintenanceCosts) / propertyRevenue) * 100 : 0;

        comparisons.push({
          id: propertyId,
          title: property.title,
          revenue: Math.round(propertyRevenue),
          occupancy,
          adr,
          bookings: propertyBookings.length,
          rating: 4.0 + Math.random() * 1.0, // Simulated
          profitMargin: Math.round(profitMargin),
          maintenanceCosts,
          averageStay: Math.round(averageStay * 10) / 10
        });
      }

      return comparisons;
    },
    enabled: selectedProperties.length >= 2
  });

  const handlePropertySelect = (propertyId: string) => {
    if (selectedProperties.includes(propertyId)) {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    } else if (selectedProperties.length < 4) {
      setSelectedProperties(prev => [...prev, propertyId]);
    }
  };

  // Prepare chart data
  const chartData = comparisonData?.map(property => ({
    name: property.title.length > 15 ? property.title.substring(0, 15) + '...' : property.title,
    Revenue: property.revenue,
    Occupancy: property.occupancy,
    ADR: property.adr,
    Bookings: property.bookings,
    'Profit Margin': property.profitMargin
  })) || [];

  // Prepare radar chart data
  const radarData = comparisonData?.map(property => ({
    property: property.title.length > 10 ? property.title.substring(0, 10) + '...' : property.title,
    occupancy: property.occupancy,
    profitMargin: property.profitMargin,
    rating: property.rating * 20, // Scale to 100
    adr: Math.min((property.adr / 500) * 100, 100), // Scale to 100
    bookings: Math.min((property.bookings / 20) * 100, 100) // Scale to 100
  })) || [];

  const getPerformanceColor = (value: number, metric: string) => {
    const thresholds = {
      occupancy: { good: 70, average: 50 },
      profitMargin: { good: 60, average: 40 },
      rating: { good: 4.5, average: 4.0 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    if (value >= threshold.good) return 'text-green-600';
    if (value >= threshold.average) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loadingProperties) {
    return <div className="animate-pulse h-64 bg-muted rounded"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Property Comparison</h2>
        <Badge variant="outline">Compare up to 4 properties</Badge>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Properties to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <Select
                key={index}
                value={selectedProperties[index] || ""}
                onValueChange={(value) => {
                  const newSelection = [...selectedProperties];
                  if (value) {
                    newSelection[index] = value;
                  } else {
                    newSelection.splice(index, 1);
                  }
                  setSelectedProperties(newSelection.filter(Boolean));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Property ${index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableProperties?.map((property) => (
                    <SelectItem
                      key={property.id}
                      value={property.id}
                      disabled={selectedProperties.includes(property.id)}
                    >
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonData && comparisonData.length >= 2 && (
        <>
          {/* Key Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Property</th>
                      <th className="text-center p-2">Revenue</th>
                      <th className="text-center p-2">Occupancy</th>
                      <th className="text-center p-2">ADR</th>
                      <th className="text-center p-2">Bookings</th>
                      <th className="text-center p-2">Profit Margin</th>
                      <th className="text-center p-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((property) => (
                      <tr key={property.id} className="border-b">
                        <td className="p-2 font-medium">{property.title}</td>
                        <td className="p-2 text-center">€{property.revenue.toLocaleString()}</td>
                        <td className="p-2 text-center">
                          <span className={getPerformanceColor(property.occupancy, 'occupancy')}>
                            {property.occupancy}%
                          </span>
                        </td>
                        <td className="p-2 text-center">€{property.adr}</td>
                        <td className="p-2 text-center">{property.bookings}</td>
                        <td className="p-2 text-center">
                          <span className={getPerformanceColor(property.profitMargin, 'profitMargin')}>
                            {property.profitMargin}%
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={getPerformanceColor(property.rating, 'rating')}>
                            {property.rating.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Visual Comparisons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue (€)" />
                      <Bar dataKey="Occupancy" fill="#10b981" name="Occupancy (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="property" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      {comparisonData.map((_, index) => (
                        <Radar
                          key={index}
                          name={`Property ${index + 1}`}
                          dataKey={['occupancy', 'profitMargin', 'rating', 'adr', 'bookings'][index % 5]}
                          stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]}
                          fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index]}
                          fillOpacity={0.1}
                        />
                      ))}
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {selectedProperties.length < 2 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Select Properties to Compare</h3>
            <p className="text-muted-foreground">
              Choose at least 2 properties from the dropdowns above to see detailed comparisons.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};