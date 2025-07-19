import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Lightbulb,
  Target
} from "lucide-react";
import { format, addDays, addMonths, startOfMonth, endOfMonth } from "date-fns";

interface RevenueOptimization {
  id: string;
  type: 'pricing' | 'availability' | 'marketing' | 'upsell';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potentialIncrease: number; // percentage
  action: string;
  priority: number;
}

interface SeasonalPattern {
  period: string;
  averageOccupancy: number;
  averageRate: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export const RevenueOptimization: React.FC = () => {
  const { data: optimizationData, isLoading } = useQuery({
    queryKey: ['revenue-optimization'],
    queryFn: async () => {
      const today = new Date();
      const nextMonth = addMonths(today, 1);
      const lastSixMonths = addMonths(today, -6);

      // Get historical data for analysis
      const [bookings, financial, listings] = await Promise.all([
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed')
          .gte('check_in', format(lastSixMonths, 'yyyy-MM-dd')),
        supabase.from('financial_reports').select('*')
          .gte('check_in', format(lastSixMonths, 'yyyy-MM-dd')),
        supabase.from('guesty_listings').select('*').eq('is_deleted', false)
      ]);

      // Analyze current performance
      const currentMonthBookings = bookings.data?.filter(b => {
        const checkIn = new Date(b.check_in);
        return checkIn >= startOfMonth(today) && checkIn <= endOfMonth(today);
      }) || [];

      const averageStayLength = currentMonthBookings.length > 0
        ? currentMonthBookings.reduce((sum, booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
            return sum + nights;
          }, 0) / currentMonthBookings.length
        : 0;

      const totalRevenue = financial.data?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0;
      const averageDailyRate = currentMonthBookings.length > 0 && totalRevenue > 0
        ? totalRevenue / (currentMonthBookings.length * averageStayLength)
        : 0;

      const occupancyRate = listings.data?.length > 0 
        ? (currentMonthBookings.length / listings.data.length) * 100 
        : 0;

      // Generate optimization recommendations
      const optimizations: RevenueOptimization[] = [];

      // Low occupancy optimization
      if (occupancyRate < 60) {
        optimizations.push({
          id: 'increase-marketing',
          type: 'marketing',
          title: 'Boost Marketing for Low Occupancy',
          description: `Current occupancy is ${Math.round(occupancyRate)}%. Increase visibility through targeted marketing.`,
          impact: 'high',
          potentialIncrease: 25,
          action: 'Launch promotional campaign with 10-15% discount',
          priority: 1
        });
      }

      // High occupancy pricing optimization
      if (occupancyRate > 85) {
        optimizations.push({
          id: 'premium-pricing',
          type: 'pricing',
          title: 'Implement Premium Pricing',
          description: `High occupancy (${Math.round(occupancyRate)}%) indicates strong demand. Consider price increases.`,
          impact: 'high',
          potentialIncrease: 15,
          action: 'Increase rates by 10-20% for peak periods',
          priority: 1
        });
      }

      // Weekend pricing optimization
      const weekendBookings = currentMonthBookings.filter(b => {
        const day = new Date(b.check_in).getDay();
        return day === 5 || day === 6; // Friday or Saturday
      });

      if (weekendBookings.length / currentMonthBookings.length > 0.6) {
        optimizations.push({
          id: 'weekend-premium',
          type: 'pricing',
          title: 'Weekend Premium Pricing',
          description: 'Strong weekend demand detected. Optimize weekend rates for maximum revenue.',
          impact: 'medium',
          potentialIncrease: 12,
          action: 'Apply 15-25% weekend surcharge',
          priority: 2
        });
      }

      // Length of stay optimization
      if (averageStayLength < 3) {
        optimizations.push({
          id: 'minimum-stay',
          type: 'availability',
          title: 'Implement Minimum Stay Requirements',
          description: `Average stay is ${averageStayLength.toFixed(1)} nights. Longer stays reduce turnover costs.`,
          impact: 'medium',
          potentialIncrease: 8,
          action: 'Set 3-night minimum for peak periods',
          priority: 3
        });
      }

      // Upselling opportunities
      if (averageDailyRate < 200) {
        optimizations.push({
          id: 'upsell-services',
          type: 'upsell',
          title: 'Add Premium Services',
          description: 'Current ADR suggests opportunity for premium service upselling.',
          impact: 'medium',
          potentialIncrease: 10,
          action: 'Offer cleaning, concierge, or experience packages',
          priority: 4
        });
      }

      // Generate seasonal patterns
      const seasonalPatterns: SeasonalPattern[] = [
        {
          period: 'Summer (Jun-Aug)',
          averageOccupancy: 85,
          averageRate: averageDailyRate * 1.4,
          trend: 'up',
          recommendation: 'Maximize rates during peak season'
        },
        {
          period: 'Spring (Mar-May)',
          averageOccupancy: 70,
          averageRate: averageDailyRate * 1.1,
          trend: 'up',
          recommendation: 'Gradual rate increases as demand builds'
        },
        {
          period: 'Fall (Sep-Nov)',
          averageOccupancy: 65,
          averageRate: averageDailyRate * 0.95,
          trend: 'down',
          recommendation: 'Focus on length of stay incentives'
        },
        {
          period: 'Winter (Dec-Feb)',
          averageOccupancy: 45,
          averageRate: averageDailyRate * 0.8,
          trend: 'stable',
          recommendation: 'Promote extended stays with discounts'
        }
      ];

      // Sort optimizations by priority and impact
      optimizations.sort((a, b) => a.priority - b.priority);

      return {
        optimizations: optimizations.slice(0, 5), // Top 5 recommendations
        seasonalPatterns,
        currentMetrics: {
          occupancyRate: Math.round(occupancyRate),
          averageDailyRate: Math.round(averageDailyRate),
          averageStayLength: Math.round(averageStayLength * 10) / 10,
          totalRevenue: Math.round(totalRevenue)
        }
      };
    },
    refetchInterval: 7200000, // Refresh every 2 hours
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      case 'low': return <TrendingDown className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-xl font-bold">{optimizationData?.currentMetrics.occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Rate</p>
                <p className="text-xl font-bold">€{optimizationData?.currentMetrics.averageDailyRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Stay Length</p>
                <p className="text-xl font-bold">{optimizationData?.currentMetrics.averageStayLength} nights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">€{optimizationData?.currentMetrics.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Revenue Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationData?.optimizations.map((opt) => (
              <Alert key={opt.id} className="border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getImpactIcon(opt.impact)}
                      <span className="font-medium">{opt.title}</span>
                      <Badge className={getImpactColor(opt.impact)}>
                        {opt.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        +{opt.potentialIncrease}% revenue
                      </Badge>
                    </div>
                    <AlertDescription className="mb-2">
                      {opt.description}
                    </AlertDescription>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600">
                        💡 {opt.action}
                      </p>
                      <Button size="sm" variant="outline">
                        Implement
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Revenue Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {optimizationData?.seasonalPatterns.map((pattern, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{pattern.period}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Occupancy:</span>
                    <span className="font-medium">{pattern.averageOccupancy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Rate:</span>
                    <span className="font-medium">€{Math.round(pattern.averageRate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trend:</span>
                    <div className="flex items-center gap-1">
                      {pattern.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                      {pattern.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                      {pattern.trend === 'stable' && <span className="text-gray-600">—</span>}
                      <span className="text-xs">{pattern.trend}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pattern.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};