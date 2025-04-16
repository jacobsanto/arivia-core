
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { inventoryUsageData } from "@/data/inventoryData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const InventoryUsage = () => {
  const [period, setPeriod] = useState("week");
  const [property, setProperty] = useState("all");

  // Filter data based on selected period and property
  const filteredData = inventoryUsageData.filter(item => {
    const matchesProperty = property === "all" || item.property === property;
    return matchesProperty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Usage Reports</h3>
          <p className="text-sm text-muted-foreground">
            Track consumption patterns across properties
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={property} onValueChange={setProperty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="villa_caldera">Villa Caldera</SelectItem>
              <SelectItem value="villa_oceana">Villa Oceana</SelectItem>
              <SelectItem value="villa_azure">Villa Azure</SelectItem>
              <SelectItem value="villa_sunset">Villa Sunset</SelectItem>
              <SelectItem value="villa_paradiso">Villa Paradiso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">Usage Reports</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {filteredData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reported By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>
                          {item.property === "villa_caldera" ? "Villa Caldera" :
                          item.property === "villa_oceana" ? "Villa Oceana" :
                          item.property === "villa_azure" ? "Villa Azure" :
                          item.property === "villa_sunset" ? "Villa Sunset" :
                          "Villa Paradiso"}
                        </TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.reportedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert className="bg-muted/50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No usage data</AlertTitle>
                  <AlertDescription>
                    No inventory usage has been recorded for the selected period and property.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Used Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-muted/50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No analytics data</AlertTitle>
                  <AlertDescription>
                    Start recording inventory usage to generate analytics.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Property Consumption</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="bg-muted/50">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>No consumption data</AlertTitle>
                  <AlertDescription>
                    Property consumption data will appear here once inventory usage is recorded.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryUsage;
