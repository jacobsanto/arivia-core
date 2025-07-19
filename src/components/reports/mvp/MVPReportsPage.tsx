import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export const MVPReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState("month");

  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['financial-reports', dateRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('financial_reports')
        .select('*')
        .order('check_in', { ascending: false })
        .limit(100);
      return data || [];
    }
  });

  const { data: bookingStats } = useQuery({
    queryKey: ['booking-stats', dateRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('guesty_bookings')
        .select('*')
        .eq('status', 'confirmed')
        .order('check_in', { ascending: false });
      
      const total = data?.length || 0;
      const thisMonth = data?.filter(b => 
        new Date(b.check_in) >= startOfMonth(new Date()) &&
        new Date(b.check_in) <= endOfMonth(new Date())
      ).length || 0;
      
      const revenue = financialData?.reduce((sum, report) => sum + (report.revenue || 0), 0) || 0;
      const profit = financialData?.reduce((sum, report) => sum + (report.profit || 0), 0) || 0;

      return {
        totalBookings: total,
        monthlyBookings: thisMonth,
        totalRevenue: revenue,
        totalProfit: profit,
        avgBookingValue: total > 0 ? revenue / total : 0
      };
    }
  });

  const { data: propertyStats } = useQuery({
    queryKey: ['property-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('guesty_listings')
        .select('*');
      
      const total = data?.length || 0;
      const active = data?.filter(p => p.status === 'active').length || 0;
      const inactive = data?.filter(p => p.status !== 'active').length || 0;

      return { total, active, inactive };
    }
  });

  const metricCards = [
    {
      title: "Total Revenue",
      value: `€${bookingStats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Bookings",
      value: bookingStats?.totalBookings || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Properties",
      value: propertyStats?.active || 0,
      icon: Building,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Net Profit",
      value: `€${bookingStats?.totalProfit?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Reports & Analytics - Arivia Villas</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track performance and analyze business metrics</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="financial" className="space-y-4">
          <TabsList>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
            <TabsTrigger value="properties">Property Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {financialLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : financialData?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No financial data available</p>
                    <p className="text-sm mt-1">Financial reports will appear here once bookings are processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialData?.slice(0, 10).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">Booking #{report.booking_id?.slice(-8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(report.check_in), 'MMM dd')} - {format(new Date(report.check_out), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            €{report.revenue?.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Profit: €{report.profit?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Booking analytics dashboard</p>
                  <p className="text-sm mt-1">Detailed booking trends and patterns will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-foreground">{propertyStats?.total || 0}</h3>
                    <p className="text-sm text-muted-foreground">Total Properties</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">{propertyStats?.active || 0}</h3>
                    <p className="text-sm text-muted-foreground">Active Properties</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold text-orange-600">{propertyStats?.inactive || 0}</h3>
                    <p className="text-sm text-muted-foreground">Inactive Properties</p>
                  </div>
                </div>
                
                <div className="text-center py-4 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Property performance metrics</p>
                  <p className="text-sm mt-1">Individual property analytics and performance comparisons</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};