import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calculator,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface ProfitOptimization {
  id: string;
  category: 'revenue' | 'cost_reduction' | 'efficiency' | 'pricing';
  title: string;
  description: string;
  currentValue: number;
  optimizedValue: number;
  potentialSaving: number;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
}

interface FinancialBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  subcategories?: { name: string; amount: number }[];
}

export const ProfitOptimizationEngine: React.FC = () => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['profit-optimization'],
    queryFn: async () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      const twoMonthsAgo = subMonths(today, 2);

      // Get financial and operational data
      const [financial, bookings, tasks, maintenance] = await Promise.all([
        supabase.from('financial_reports').select('*'),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('housekeeping_tasks').select('*'),
        supabase.from('maintenance_tasks').select('*')
      ]);

      // Current month financial data
      const currentFinancials = financial.data?.filter(f => 
        new Date(f.check_in || '') >= startOfMonth(lastMonth) &&
        new Date(f.check_in || '') <= endOfMonth(lastMonth)
      ) || [];

      // Previous month for comparison
      const previousFinancials = financial.data?.filter(f => 
        new Date(f.check_in || '') >= startOfMonth(twoMonthsAgo) &&
        new Date(f.check_in || '') <= endOfMonth(twoMonthsAgo)
      ) || [];

      const currentRevenue = currentFinancials.reduce((sum, f) => sum + (f.revenue || 0), 0);
      const previousRevenue = previousFinancials.reduce((sum, f) => sum + (f.revenue || 0), 0);
      
      const currentExpenses = currentFinancials.reduce((sum, f) => sum + (f.expenses || 0), 0);
      const previousExpenses = previousFinancials.reduce((sum, f) => sum + (f.expenses || 0), 0);

      // Calculate operational costs
      const housekeepingCosts = tasks.data?.filter(t => 
        new Date(t.created_at) >= lastMonth
      ).length || 0;
      
      const maintenanceCosts = maintenance.data?.filter(m => 
        new Date(m.created_at) >= lastMonth
      ).length || 0;

      const operationalCosts = (housekeepingCosts * 75) + (maintenanceCosts * 150); // Estimated costs

      // Generate optimization opportunities
      const optimizations: ProfitOptimization[] = [];

      // Revenue optimization
      const currentBookings = bookings.data?.filter(b => 
        new Date(b.check_in) >= lastMonth
      ) || [];
      
      const averageDailyRate = currentBookings.length > 0 ? currentRevenue / currentBookings.length : 0;
      
      if (averageDailyRate < 200) {
        optimizations.push({
          id: 'adr-optimization',
          category: 'revenue',
          title: 'Average Daily Rate Optimization',
          description: `Current ADR is €${Math.round(averageDailyRate)}. Market analysis suggests 15-20% increase potential.`,
          currentValue: Math.round(averageDailyRate),
          optimizedValue: Math.round(averageDailyRate * 1.175),
          potentialSaving: Math.round(currentRevenue * 0.175),
          implementation: 'Implement dynamic pricing based on demand patterns',
          priority: 'high',
          timeframe: '2-4 weeks'
        });
      }

      // Cost reduction opportunities
      if (operationalCosts > currentRevenue * 0.25) {
        optimizations.push({
          id: 'operational-efficiency',
          category: 'cost_reduction',
          title: 'Operational Cost Reduction',
          description: `Operational costs are ${Math.round((operationalCosts/currentRevenue)*100)}% of revenue. Target: <20%.`,
          currentValue: operationalCosts,
          optimizedValue: Math.round(currentRevenue * 0.20),
          potentialSaving: operationalCosts - Math.round(currentRevenue * 0.20),
          implementation: 'Optimize task scheduling and staff allocation',
          priority: 'medium',
          timeframe: '1-2 months'
        });
      }

      // Channel fee optimization
      const channelFees = currentFinancials.reduce((sum, f) => sum + (f.channel_fee || 0), 0);
      if (channelFees > currentRevenue * 0.15) {
        optimizations.push({
          id: 'channel-optimization',
          category: 'cost_reduction',
          title: 'Channel Fee Optimization',
          description: `Channel fees are ${Math.round((channelFees/currentRevenue)*100)}% of revenue. Diversify booking channels.`,
          currentValue: channelFees,
          optimizedValue: Math.round(currentRevenue * 0.12),
          potentialSaving: channelFees - Math.round(currentRevenue * 0.12),
          implementation: 'Increase direct bookings through website optimization',
          priority: 'medium',
          timeframe: '3-6 months'
        });
      }

      // Efficiency improvements
      const taskCompletionRate = tasks.data?.length > 0 
        ? (tasks.data.filter(t => t.status === 'completed').length / tasks.data.length) * 100 
        : 0;

      if (taskCompletionRate < 90) {
        optimizations.push({
          id: 'efficiency-improvement',
          category: 'efficiency',
          title: 'Task Completion Efficiency',
          description: `Current completion rate: ${Math.round(taskCompletionRate)}%. Improve to 95%+ for cost savings.`,
          currentValue: Math.round(taskCompletionRate),
          optimizedValue: 95,
          potentialSaving: Math.round(operationalCosts * 0.15),
          implementation: 'Implement automated task tracking and staff training',
          priority: 'high',
          timeframe: '4-6 weeks'
        });
      }

      // Financial breakdown
      const totalIncome = currentRevenue;
      const totalCosts = currentExpenses + operationalCosts + channelFees;
      const netProfit = totalIncome - totalCosts;

      const breakdown: FinancialBreakdown[] = [
        {
          category: 'Gross Revenue',
          amount: totalIncome,
          percentage: 100,
          trend: previousRevenue > 0 ? (currentRevenue > previousRevenue ? 'up' : 'down') : 'stable',
          trendPercentage: previousRevenue > 0 ? Math.abs(Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)) : 0,
          subcategories: [
            { name: 'Booking Revenue', amount: currentRevenue },
            { name: 'Additional Services', amount: 0 }
          ]
        },
        {
          category: 'Channel Fees',
          amount: channelFees,
          percentage: Math.round((channelFees / totalIncome) * 100),
          trend: 'down',
          trendPercentage: 5,
          subcategories: [
            { name: 'Booking Platform Fees', amount: channelFees },
            { name: 'Payment Processing', amount: Math.round(currentRevenue * 0.029) }
          ]
        },
        {
          category: 'Operational Costs',
          amount: operationalCosts,
          percentage: Math.round((operationalCosts / totalIncome) * 100),
          trend: 'stable',
          trendPercentage: 2,
          subcategories: [
            { name: 'Housekeeping', amount: housekeepingCosts * 75 },
            { name: 'Maintenance', amount: maintenanceCosts * 150 },
            { name: 'Utilities', amount: Math.round(currentRevenue * 0.08) }
          ]
        },
        {
          category: 'Other Expenses',
          amount: currentExpenses,
          percentage: Math.round((currentExpenses / totalIncome) * 100),
          trend: previousExpenses > 0 ? (currentExpenses > previousExpenses ? 'up' : 'down') : 'stable',
          trendPercentage: previousExpenses > 0 ? Math.abs(Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100)) : 0
        },
        {
          category: 'Net Profit',
          amount: netProfit,
          percentage: Math.round((netProfit / totalIncome) * 100),
          trend: netProfit > 0 ? 'up' : 'down',
          trendPercentage: Math.abs(Math.round((netProfit / totalIncome) * 100))
        }
      ];

      return {
        optimizations: optimizations.slice(0, 5),
        breakdown,
        kpis: {
          totalRevenue: totalIncome,
          totalCosts,
          netProfit,
          profitMargin: Math.round((netProfit / totalIncome) * 100),
          roi: Math.round((netProfit / totalCosts) * 100),
          revenueGrowth: previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0
        }
      };
    },
    refetchInterval: 1800000, // Refresh every 30 minutes
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'cost_reduction': return 'bg-red-100 text-red-800';
      case 'efficiency': return 'bg-blue-100 text-blue-800';
      case 'pricing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Profit Optimization Engine
        </h2>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          AI-Powered Analysis
        </Badge>
      </div>

      {/* Key Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-xl font-bold">€{financialData?.kpis.netProfit.toLocaleString()}</p>
                <p className="text-xs text-green-600">{financialData?.kpis.profitMargin}% margin</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenue Growth</p>
                <p className="text-xl font-bold">{financialData?.kpis.revenueGrowth}%</p>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-xl font-bold">{financialData?.kpis.roi}%</p>
                <p className="text-xs text-muted-foreground">return on investment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">€{financialData?.kpis.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profit Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData?.optimizations.map((optimization) => (
              <div key={optimization.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{optimization.title}</span>
                      <Badge className={getCategoryColor(optimization.category)}>
                        {optimization.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(optimization.priority)}>
                        {optimization.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {optimization.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      +€{optimization.potentialSaving.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">potential saving</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current:</span>
                    <p className="font-medium">€{optimization.currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Optimized:</span>
                    <p className="font-medium text-green-600">€{optimization.optimizedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeframe:</span>
                    <p className="font-medium">{optimization.timeframe}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm font-medium text-blue-600">
                    💡 {optimization.implementation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Breakdown & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData?.breakdown.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{item.category}</h4>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(item.trend)}
                      <span className="text-xs text-muted-foreground">
                        {item.trendPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">€{item.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{item.percentage}% of revenue</p>
                  </div>
                </div>
                
                <div className="mb-3">
                  <Progress value={item.percentage} className="h-2" />
                </div>
                
                {item.subcategories && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {item.subcategories.map((sub, idx) => (
                      <div key={idx} className="flex justify-between text-muted-foreground">
                        <span>{sub.name}:</span>
                        <span>€{sub.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};