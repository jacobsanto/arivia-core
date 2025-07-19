import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Calendar, Target, AlertTriangle } from "lucide-react";
import { format, addMonths, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns";

interface FinancialForecast {
  month: string;
  actualRevenue?: number;
  predictedRevenue: number;
  actualExpenses?: number;
  predictedExpenses: number;
  actualProfit?: number;
  predictedProfit: number;
  confidence: number;
  seasonalFactor: number;
}

interface CashFlowProjection {
  category: string;
  currentMonth: number;
  nextMonth: number;
  threeMonths: number;
  sixMonths: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export const FinancialForecasting: React.FC = () => {
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ['financial-forecasting'],
    queryFn: async () => {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);
      const sixMonthsAhead = addMonths(today, 6);

      // Get historical financial data
      const [financial, bookings] = await Promise.all([
        supabase.from('financial_reports').select('*'),
        supabase.from('guesty_bookings').select('*').eq('status', 'confirmed')
      ]);

      // Generate month range for forecasting
      const monthRange = eachMonthOfInterval({
        start: sixMonthsAgo,
        end: sixMonthsAhead
      });

      const forecast: FinancialForecast[] = monthRange.map(month => {
        const monthStr = format(month, 'MMM yyyy');
        const isHistorical = month <= today;
        
        if (isHistorical) {
          // Historical data
          const monthlyFinancials = financial.data?.filter(f => {
            const checkIn = new Date(f.check_in || '');
            return checkIn >= startOfMonth(month) && checkIn <= endOfMonth(month);
          }) || [];

          const revenue = monthlyFinancials.reduce((sum, f) => sum + (f.revenue || 0), 0);
          const expenses = monthlyFinancials.reduce((sum, f) => sum + (f.expenses || 0), 0);
          const profit = revenue - expenses;

          return {
            month: monthStr,
            actualRevenue: revenue,
            predictedRevenue: revenue,
            actualExpenses: expenses,
            predictedExpenses: expenses,
            actualProfit: profit,
            predictedProfit: profit,
            confidence: 100,
            seasonalFactor: 1.0
          };
        } else {
          // Predictive modeling
          const monthIndex = month.getMonth();
          
          // Calculate seasonal factors (simplified)
          let seasonalFactor = 1.0;
          if (monthIndex >= 5 && monthIndex <= 7) { // Summer
            seasonalFactor = 1.4;
          } else if (monthIndex >= 11 || monthIndex <= 1) { // Winter
            seasonalFactor = 0.7;
          } else if (monthIndex >= 2 && monthIndex <= 4) { // Spring
            seasonalFactor = 1.1;
          } else { // Fall
            seasonalFactor = 0.9;
          }

          // Calculate historical averages
          const historicalData = financial.data?.filter(f => {
            const checkIn = new Date(f.check_in || '');
            return checkIn >= sixMonthsAgo && checkIn <= today;
          }) || [];

          const avgMonthlyRevenue = historicalData.length > 0
            ? historicalData.reduce((sum, f) => sum + (f.revenue || 0), 0) / 6
            : 5000;

          const avgMonthlyExpenses = historicalData.length > 0
            ? historicalData.reduce((sum, f) => sum + (f.expenses || 0), 0) / 6
            : 1500;

          // Apply growth trend (assuming 5% monthly growth)
          const monthsFromNow = Math.ceil((month.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const growthFactor = Math.pow(1.05, monthsFromNow);

          const predictedRevenue = Math.round(avgMonthlyRevenue * seasonalFactor * growthFactor);
          const predictedExpenses = Math.round(avgMonthlyExpenses * (1 + (monthsFromNow * 0.02))); // 2% expense growth
          const predictedProfit = predictedRevenue - predictedExpenses;

          // Confidence decreases with distance
          const confidence = Math.max(60, 95 - (monthsFromNow * 8));

          return {
            month: monthStr,
            predictedRevenue,
            predictedExpenses,
            predictedProfit,
            confidence,
            seasonalFactor
          };
        }
      });

      // Cash flow projections
      const currentMonthRevenue = forecast.find(f => f.month === format(today, 'MMM yyyy'))?.actualRevenue || 0;
      const projectedRevenue = forecast.filter(f => !f.actualRevenue).slice(0, 6);
      
      const cashFlowProjections: CashFlowProjection[] = [
        {
          category: 'Total Revenue',
          currentMonth: currentMonthRevenue,
          nextMonth: projectedRevenue[0]?.predictedRevenue || 0,
          threeMonths: projectedRevenue.slice(0, 3).reduce((sum, f) => sum + f.predictedRevenue, 0),
          sixMonths: projectedRevenue.reduce((sum, f) => sum + f.predictedRevenue, 0),
          trend: 'increasing'
        },
        {
          category: 'Operating Expenses',
          currentMonth: forecast.find(f => f.month === format(today, 'MMM yyyy'))?.actualExpenses || 0,
          nextMonth: projectedRevenue[0]?.predictedExpenses || 0,
          threeMonths: projectedRevenue.slice(0, 3).reduce((sum, f) => sum + f.predictedExpenses, 0),
          sixMonths: projectedRevenue.reduce((sum, f) => sum + f.predictedExpenses, 0),
          trend: 'stable'
        },
        {
          category: 'Net Profit',
          currentMonth: (forecast.find(f => f.month === format(today, 'MMM yyyy'))?.actualRevenue || 0) - 
                       (forecast.find(f => f.month === format(today, 'MMM yyyy'))?.actualExpenses || 0),
          nextMonth: (projectedRevenue[0]?.predictedRevenue || 0) - (projectedRevenue[0]?.predictedExpenses || 0),
          threeMonths: projectedRevenue.slice(0, 3).reduce((sum, f) => sum + f.predictedProfit, 0),
          sixMonths: projectedRevenue.reduce((sum, f) => sum + f.predictedProfit, 0),
          trend: 'increasing'
        }
      ];

      // Financial KPIs and alerts
      const nextMonthProfit = projectedRevenue[0]?.predictedProfit || 0;
      const currentProfit = cashFlowProjections[2].currentMonth;
      const profitGrowth = currentProfit > 0 ? ((nextMonthProfit - currentProfit) / currentProfit) * 100 : 0;

      const alerts = [];
      
      if (profitGrowth < 0) {
        alerts.push({
          type: 'warning',
          message: `Profit projected to decrease by ${Math.abs(Math.round(profitGrowth))}% next month`,
          action: 'Review pricing strategy and cost optimization'
        });
      }

      const avgConfidence = projectedRevenue.reduce((sum, f) => sum + f.confidence, 0) / projectedRevenue.length;
      if (avgConfidence < 75) {
        alerts.push({
          type: 'info',
          message: `Forecast confidence is ${Math.round(avgConfidence)}% - consider updating with recent data`,
          action: 'Refresh forecasting model with latest booking trends'
        });
      }

      return {
        forecast,
        cashFlowProjections,
        alerts,
        kpis: {
          projectedGrowth: profitGrowth,
          forecastConfidence: avgConfidence,
          breakEvenPoint: projectedRevenue.findIndex(f => f.predictedProfit > 0) + 1,
          totalProjectedRevenue: projectedRevenue.reduce((sum, f) => sum + f.predictedRevenue, 0)
        }
      };
    },
    refetchInterval: 3600000, // Refresh every hour
  });

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-red-50 border-red-200 text-red-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded"></div>
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
          <TrendingUp className="h-5 w-5" />
          Financial Forecasting & Cash Flow
        </h2>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          6-Month Projection
        </Badge>
      </div>

      {/* Key Forecast Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Projected Growth</p>
                <p className="text-xl font-bold">{forecastData?.kpis.projectedGrowth.toFixed(1)}%</p>
                <p className="text-xs text-green-600">next month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Forecast Confidence</p>
                <p className="text-xl font-bold">{forecastData?.kpis.forecastConfidence.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">6-Month Revenue</p>
                <p className="text-xl font-bold">€{forecastData?.kpis.totalProjectedRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">projected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Break-even</p>
                <p className="text-xl font-bold">{forecastData?.kpis.breakEvenPoint}</p>
                <p className="text-xs text-muted-foreground">months ahead</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData?.forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`€${value?.toLocaleString()}`, name]} />
                <Area 
                  type="monotone" 
                  dataKey="actualRevenue" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f620" 
                  name="Actual Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="predictedRevenue" 
                  stackId="2"
                  stroke="#10b981" 
                  fill="#10b98120"
                  strokeDasharray="5 5"
                  name="Predicted Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="predictedProfit" 
                  stackId="3"
                  stroke="#f59e0b" 
                  fill="#f59e0b20"
                  name="Predicted Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-center p-2">Current Month</th>
                  <th className="text-center p-2">Next Month</th>
                  <th className="text-center p-2">3 Months</th>
                  <th className="text-center p-2">6 Months</th>
                  <th className="text-center p-2">Trend</th>
                </tr>
              </thead>
              <tbody>
                {forecastData?.cashFlowProjections.map((projection, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{projection.category}</td>
                    <td className="p-2 text-center">€{projection.currentMonth.toLocaleString()}</td>
                    <td className="p-2 text-center">€{projection.nextMonth.toLocaleString()}</td>
                    <td className="p-2 text-center">€{projection.threeMonths.toLocaleString()}</td>
                    <td className="p-2 text-center">€{projection.sixMonths.toLocaleString()}</td>
                    <td className="p-2 text-center">
                      <span className={getTrendColor(projection.trend)}>
                        {projection.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Alerts */}
      {forecastData?.alerts && forecastData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Financial Alerts & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {forecastData.alerts.map((alert, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                  <p className="font-medium mb-1">{alert.message}</p>
                  <p className="text-sm">💡 {alert.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};