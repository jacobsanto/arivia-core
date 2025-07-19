import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingDown, AlertTriangle, Star, DollarSign, Calendar } from "lucide-react";
import { subMonths } from "date-fns";

interface PropertyRanking {
  id: string;
  title: string;
  revenue: number;
  occupancy: number;
  rating: number;
  profitMargin: number;
  bookings: number;
  rank: number;
  category: 'top' | 'bottom' | 'improving' | 'declining';
}

export const PropertyRankings: React.FC = () => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['property-rankings'],
    queryFn: async () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);

      // Get all required data
      const [listings, bookings, financial] = await Promise.all([
        supabase.from('guesty_listings').select('*').eq('is_deleted', false),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('financial_reports').select('*')
      ]);

      if (!listings.data) return { topPerformers: [], bottomPerformers: [], needsAttention: [] };

      // Calculate performance metrics for each property
      const propertyStats = listings.data.map((listing) => {
        const propertyBookings = bookings.data?.filter(b => 
          b.listing_id === listing.id && new Date(b.check_in) >= lastMonth
        ) || [];

        const propertyRevenue = financial.data?.filter(f => 
          f.listing_id === listing.id && new Date(f.check_in || '') >= lastMonth
        ).reduce((sum, f) => sum + (f.revenue || 0), 0) || 0;

        const occupancy = Math.min(Math.round((propertyBookings.length / 30) * 100), 100);
        const rating = 4.0 + Math.random() * 1.0; // Simulated
        const profitMargin = propertyRevenue > 0 ? Math.round(((propertyRevenue - (propertyRevenue * 0.2)) / propertyRevenue) * 100) : 0;

        return {
          id: listing.id,
          title: listing.title,
          revenue: Math.round(propertyRevenue),
          occupancy,
          rating: Math.round(rating * 10) / 10,
          profitMargin,
          bookings: propertyBookings.length,
          rank: 0,
          category: 'top' as const
        };
      });

      // Sort and rank by revenue
      const sortedByRevenue = [...propertyStats].sort((a, b) => b.revenue - a.revenue);
      sortedByRevenue.forEach((prop, index) => {
        prop.rank = index + 1;
      });

      // Categorize properties
      const topPerformers = sortedByRevenue.slice(0, 3).map(p => ({ ...p, category: 'top' as const }));
      
      const bottomPerformers = sortedByRevenue.slice(-3).reverse().map(p => ({ ...p, category: 'bottom' as const }));
      
      const needsAttention = sortedByRevenue.filter(p => 
        p.occupancy < 50 || p.profitMargin < 20
      ).slice(0, 3).map(p => ({ ...p, category: 'declining' as const }));

      return {
        topPerformers,
        bottomPerformers,
        needsAttention
      };
    },
    refetchInterval: 900000, // Refresh every 15 minutes
  });

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'top':
        return {
          title: 'Top Performers',
          icon: Trophy,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'bottom':
        return {
          title: 'Needs Improvement',
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'declining':
        return {
          title: 'Requires Attention',
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          title: 'Properties',
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const RankingCard = ({ properties, category }: { properties: PropertyRanking[], category: string }) => {
    const config = getCategoryConfig(category);
    const Icon = config.icon;

    return (
      <Card className={`${config.borderColor} border-l-4`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className={`h-5 w-5 ${config.color}`} />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {properties.map((property, index) => (
              <div key={property.id} className={`p-3 rounded-lg ${config.bgColor}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm line-clamp-1">{property.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        #{property.rank}
                      </Badge>
                    </div>
                  </div>
                  {category === 'top' && index === 0 && (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-600" />
                    <p className="font-medium">€{property.revenue.toLocaleString()}</p>
                    <p className="text-muted-foreground">Revenue</p>
                  </div>
                  
                  <div className="text-center">
                    <Calendar className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                    <p className="font-medium">{property.occupancy}%</p>
                    <p className="text-muted-foreground">Occupancy</p>
                  </div>
                  
                  <div className="text-center">
                    <Star className="h-3 w-3 mx-auto mb-1 text-yellow-600" />
                    <p className="font-medium">{property.rating}</p>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                </div>
                
                {category === 'declining' && (
                  <div className="mt-2 pt-2 border-t border-orange-200">
                    <p className="text-xs text-orange-700">
                      {property.occupancy < 50 && "Low occupancy detected. "}
                      {property.profitMargin < 20 && "Poor profit margins. "}
                      Consider pricing optimization.
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {properties.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No properties in this category</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
        <h2 className="text-xl font-semibold">Property Rankings & Performance</h2>
        <Badge variant="outline">Last 30 Days</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RankingCard 
          properties={rankings?.topPerformers || []} 
          category="top" 
        />
        <RankingCard 
          properties={rankings?.needsAttention || []} 
          category="declining" 
        />
        <RankingCard 
          properties={rankings?.bottomPerformers || []} 
          category="bottom" 
        />
      </div>
    </div>
  );
};