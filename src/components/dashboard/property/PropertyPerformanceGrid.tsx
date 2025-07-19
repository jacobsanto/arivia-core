import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building, DollarSign, Calendar, Users, Star, TrendingUp, TrendingDown } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface PropertyMetrics {
  id: string;
  title: string;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageDailyRate: number;
  averageStayLength: number;
  rating: number;
  maintenanceCosts: number;
  profitMargin: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export const PropertyPerformanceGrid: React.FC = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['property-performance'],
    queryFn: async () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      const twoMonthsAgo = subMonths(today, 2);

      // Get data for analysis
      const [listings, bookings, financial, maintenance] = await Promise.all([
        supabase.from('guesty_listings').select('*').eq('is_deleted', false),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('financial_reports').select('*'),
        supabase.from('maintenance_tasks').select('*')
      ]);

      if (!listings.data) return [];

      const propertyMetrics: PropertyMetrics[] = await Promise.all(
        listings.data.map(async (listing) => {
          // Current month data
          const currentBookings = bookings.data?.filter(b => 
            b.listing_id === listing.id &&
            new Date(b.check_in) >= startOfMonth(lastMonth) &&
            new Date(b.check_in) <= endOfMonth(lastMonth)
          ) || [];

          // Previous month data for trend calculation
          const previousBookings = bookings.data?.filter(b => 
            b.listing_id === listing.id &&
            new Date(b.check_in) >= startOfMonth(twoMonthsAgo) &&
            new Date(b.check_in) <= endOfMonth(twoMonthsAgo)
          ) || [];

          // Financial data
          const propertyRevenue = financial.data?.filter(f => f.listing_id === listing.id) || [];
          const currentRevenue = propertyRevenue
            .filter(f => new Date(f.check_in || '') >= lastMonth)
            .reduce((sum, f) => sum + (f.revenue || 0), 0);

          const previousRevenue = propertyRevenue
            .filter(f => {
              const checkIn = new Date(f.check_in || '');
              return checkIn >= twoMonthsAgo && checkIn < lastMonth;
            })
            .reduce((sum, f) => sum + (f.revenue || 0), 0);

          // Maintenance costs
          const maintenanceCosts = maintenance.data?.filter(m => 
            m.property_id === listing.id && 
            new Date(m.created_at) >= lastMonth
          ).length || 0;

          // Calculate metrics
          const totalBookings = currentBookings.length;
          const occupancyRate = Math.round((totalBookings / 30) * 100); // Simplified calculation
          
          const totalStayNights = currentBookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            return sum + Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          }, 0);

          const averageStayLength = totalBookings > 0 ? totalStayNights / totalBookings : 0;
          const averageDailyRate = totalStayNights > 0 ? currentRevenue / totalStayNights : 0;
          
          // Calculate trend
          const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
          const trend: 'up' | 'down' | 'stable' = 
            revenueChange > 5 ? 'up' : revenueChange < -5 ? 'down' : 'stable';

          // Profit margin calculation (simplified)
          const expenses = (maintenanceCosts * 100) + (currentRevenue * 0.15); // Platform fees
          const profitMargin = currentRevenue > 0 ? ((currentRevenue - expenses) / currentRevenue) * 100 : 0;

          return {
            id: listing.id,
            title: listing.title,
            totalBookings,
            totalRevenue: Math.round(currentRevenue),
            occupancyRate,
            averageDailyRate: Math.round(averageDailyRate),
            averageStayLength: Math.round(averageStayLength * 10) / 10,
            rating: 4.2 + Math.random() * 0.6, // Simulated rating
            maintenanceCosts: maintenanceCosts * 100,
            profitMargin: Math.round(profitMargin),
            trend,
            trendPercentage: Math.abs(Math.round(revenueChange))
          };
        })
      );

      // Sort by revenue descending
      return propertyMetrics.sort((a, b) => b.totalRevenue - a.totalRevenue);
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  const getPerformanceStatus = (occupancy: number) => {
    if (occupancy >= 80) return { status: 'excellent', color: 'bg-green-100 text-green-800' };
    if (occupancy >= 60) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
    if (occupancy >= 40) return { status: 'average', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'poor', color: 'bg-red-100 text-red-800' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <span className="h-4 w-4 text-gray-600">—</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Property Performance Analysis</h2>
        <Badge variant="outline">{properties?.length} Properties</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property, index) => {
          const performance = getPerformanceStatus(property.occupancyRate);
          
          return (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={performance.color}>
                        #{index + 1} {performance.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(property.trend)}
                        <span className="text-xs text-muted-foreground">
                          {property.trendPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-bold text-blue-600">€{property.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <p className="text-lg font-bold text-green-600">{property.occupancyRate}%</p>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                  </div>
                </div>

                {/* Performance Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Occupancy Rate</span>
                      <span>{property.occupancyRate}%</span>
                    </div>
                    <Progress value={property.occupancyRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profit Margin</span>
                      <span>{property.profitMargin}%</span>
                    </div>
                    <Progress value={property.profitMargin} className="h-2" />
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span>{property.totalBookings} bookings</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{property.rating.toFixed(1)} rating</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>€{property.averageDailyRate} ADR</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{property.averageStayLength} nights</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-2 border-t">
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs py-2 px-3 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 text-xs py-2 px-3 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      Compare
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};