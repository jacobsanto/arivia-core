// @ts-nocheck
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: inventoryItems, isLoading } = useQuery({
    queryKey: ['inventory-items', searchTerm],
    queryFn: async () => {
      let query = supabase.from('inventory_items').select('*');
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      const { data } = await query.order('name', { ascending: true });
      return data || [];
    }
  });

  const inventoryStats = {
    totalItems: inventoryItems?.length || 0,
    lowStock: 0, // Mock data - would need inventory_stock table join
    outOfStock: 0, // Mock data - would need inventory_stock table join  
    wellStocked: inventoryItems?.length || 0
  };

  const getStockStatus = (item: any) => {
    // Mock stock status since inventory_stock table would be needed for real quantities
    return { status: 'in-stock', color: 'bg-green-100 text-green-800', label: 'Active Item' };
  };

  const metricCards = [
    {
      title: "Total Items",
      value: inventoryStats.totalItems,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Low Stock",
      value: inventoryStats.lowStock,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Out of Stock",
      value: inventoryStats.outOfStock,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Well Stocked",
      value: inventoryStats.wellStocked,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Inventory Management - Arivia Villas</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Track and manage your property supplies</p>
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
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

        {/* Inventory Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <CardTitle className="flex-1">All Inventory Items</CardTitle>
                  <div className="relative max-w-md w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                        <div className="h-12 w-12 bg-muted rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : inventoryItems?.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No inventory items found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? 'Try adjusting your search terms' : 'Start by adding inventory items to track'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventoryItems?.map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="p-2 rounded-lg bg-muted">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description || 'No description'} • Unit: {item.unit}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Min Quantity: {item.min_quantity} • Code: {item.item_code || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className={stockStatus.color}>
                                  {stockStatus.label}
                                </Badge>
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">
                                    Min: {item.min_quantity} {item.unit}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Code: {item.item_code || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle>Items Requiring Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryItems?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>All items are well stocked!</p>
                    </div>
                  ) : (
                    inventoryItems?.slice(0, 3).map((item) => {
                      const stockStatus = getStockStatus(item);
                      return (
                        <Card key={item.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Min: {item.min_quantity} {item.unit} • Code: {item.item_code || 'N/A'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={stockStatus.color}>
                                  {stockStatus.label}
                                </Badge>
                                <Button size="sm">
                                  Reorder
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Category breakdown</p>
                  <p className="text-sm mt-1">View inventory organized by categories</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};