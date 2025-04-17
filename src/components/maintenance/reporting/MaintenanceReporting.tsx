import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ReportingHeader } from '@/components/tasks/reporting/ReportingHeader';
import { DateRangeSelector } from '@/components/reports/DateRangeSelector';
import { ReportActionButtons } from '@/components/tasks/reporting/ReportActionButtons';
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Filter, RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SwipeableList } from "@/components/ui/swipeable-list";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TimeFilter } from "@/utils/dateRangeUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Empty data instead of mock data
const maintenanceCompletionData: any[] = [];
const maintenanceTechData: any[] = [];
const maintenanceTypeData: any[] = [];

const barColors = {
  completed: '#94a3b8',
  rejected: '#f87171',
  approved: '#4ade80',
  pending: '#f59e0b'
};

const MaintenanceReporting = () => {
  const [dateRange, setDateRange] = useState<TimeFilter>('month');
  const [customDateRange, setCustomDateRange] = useState({
    from: undefined,
    to: undefined
  });
  const [activeTab, setActiveTab] = useState("properties");
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState('all');
  const isMobile = useIsMobile();

  // Simply return empty arrays instead of filtering mock data
  const getCurrentData = () => {
    switch (activeTab) {
      case 'properties':
        return maintenanceCompletionData;
      case 'technicians':
        return maintenanceTechData;
      case 'types':
        return maintenanceTypeData;
      default:
        return [];
    }
  };

  const handleDateRangeChange = (range: any) => {
    setCustomDateRange(range);
    if (range.from && range.to) {
      setDateRange('custom');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const handlePropertyChange = (property: string) => {
    setPropertyFilter(property);
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <ReportingHeader 
          dateRange={dateRange} 
          setDateRange={setDateRange} 
          isLoading={isLoading || isRefreshing}
        />
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {dateRange === 'custom' && (
            <div className="w-full sm:w-64">
              <DateRangeSelector 
                value={customDateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          )}
          
          <ReportActionButtons 
            activeTab={activeTab} 
            dateRange={dateRange} 
            data={getCurrentData()} 
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search reports..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-9" 
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSearchQuery('')} 
            disabled={!searchQuery}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {/* No need for property filtering buttons since there's no mock data */}
      
      <div className="w-full overflow-hidden">
        <Tabs defaultValue="properties" value={activeTab} onValueChange={setActiveTab}>
          <div className="mobile-scroll">
            <TabsList className={`${isMobile ? 'w-[300px] min-w-full' : 'w-full'} grid grid-cols-3 mb-4`}>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="technicians">Technicians</TabsTrigger>
              <TabsTrigger value="types">Main. Types</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="properties" className="space-y-4">
            <PropertyMaintenanceReport 
              isMobile={isMobile} 
              data={[]} 
              isLoading={isLoading || isRefreshing} 
            />
          </TabsContent>
          
          <TabsContent value="technicians" className="space-y-4">
            <TechnicianReport 
              isMobile={isMobile} 
              data={[]} 
              isLoading={isLoading || isRefreshing} 
            />
          </TabsContent>
          
          <TabsContent value="types" className="space-y-4">
            <MaintenanceTypeReport 
              data={[]} 
              isLoading={isLoading || isRefreshing} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const PropertyMaintenanceReport = ({
  isMobile,
  data = [],
  isLoading = false
}: {
  isMobile: boolean;
  data?: any[];
  isLoading?: boolean;
}) => {
  // Show empty state with alert if no data and not loading
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 py-0 px-0 mx-0 my-0 rounded-sm">
            <h3 className="text-lg font-medium mb-4 text-center">Maintenance Tasks by Property</h3>
            <Alert className="bg-muted/50 m-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No maintenance data available</AlertTitle>
              <AlertDescription>
                Maintenance data will appear here once tasks are created and completed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 py-0 px-0 mx-0 my-0 rounded-sm">
          <h3 className="text-lg font-medium mb-4 text-center">Maintenance Tasks by Property</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-0 py-[100px] my-[19px] mx-0 px-0">
              <ChartContainer config={{
                completed: {
                  label: "Total Completed",
                  color: barColors.completed
                },
                rejected: {
                  label: "Rejected",
                  color: barColors.rejected
                },
                approved: {
                  label: "Approved",
                  color: barColors.approved
                },
                pending: {
                  label: "Pending",
                  color: barColors.pending
                }
              }}>
                <BarChart 
                  data={data} 
                  margin={isMobile ? {
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 60
                  } : {
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    angle={isMobile ? -45 : 0} 
                    textAnchor={isMobile ? "end" : "middle"} 
                    height={60} 
                    tick={{
                      fontSize: isMobile ? 10 : 12
                    }} 
                  />
                  <YAxis 
                    tick={{
                      fontSize: isMobile ? 10 : 12
                    }} 
                    width={isMobile ? 30 : 40} 
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" name="Total Completed" fill={barColors.completed} />
                  <Bar dataKey="rejected" name="Rejected" fill={barColors.rejected} />
                  <Bar dataKey="approved" name="Approved" fill={barColors.approved} />
                  <Bar dataKey="pending" name="Pending" fill={barColors.pending} />
                </BarChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TechnicianReport = ({
  isMobile,
  data = [],
  isLoading = false
}: {
  isMobile: boolean;
  data?: any[];
  isLoading?: boolean;
}) => {
  // Show empty state with alert if no data and not loading
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 text-center">Technician Performance</h3>
            <Alert className="bg-muted/50">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No technician data available</AlertTitle>
              <AlertDescription>
                Technician performance data will appear here once maintenance tasks are assigned and completed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-0 mx-[3px] py-px px-0 my-[23px]">
          <h3 className="text-lg font-medium mb-4 mx-0 px-[17px] my-[2px] py-[7px] text-center">Technician Performance</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data} 
                  margin={{
                    top: 5,
                    right: isMobile ? 10 : 30,
                    left: isMobile ? 0 : 20,
                    bottom: isMobile ? 40 : 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={isMobile ? -45 : 0} 
                    textAnchor={isMobile ? "end" : "middle"} 
                    height={isMobile ? 60 : 30} 
                    tick={{
                      fontSize: isMobile ? 10 : 12
                    }} 
                  />
                  <YAxis 
                    tick={{
                      fontSize: isMobile ? 10 : 12
                    }} 
                  />
                  <Tooltip />
                  <Bar dataKey="completed" name="Tasks Completed" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      {isMobile ? (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Technician Performance Details</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {data.map(tech => (
                  <Card key={tech.name} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{tech.name}</h4>
                        <Badge className={tech.rating >= 4.8 ? "bg-green-100 text-green-800 hover:bg-green-200" : tech.rating >= 4.6 ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-amber-100 text-amber-800 hover:bg-amber-200"}>
                          {tech.rating}/5.0
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Tasks Completed</div>
                          <div className="font-medium">{tech.completed}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Avg. Time</div>
                          <div className="font-medium">{tech.avgTime} min</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-muted-foreground">Feedback</div>
                          <div className="font-medium">
                            {tech.rating >= 4.8 ? "Excellent technical skills" : tech.rating >= 4.6 ? "Good overall performance" : "Needs improvement in efficiency"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Technician Performance Details</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Technician</TableHead>
                      <TableHead>Tasks Completed</TableHead>
                      <TableHead>Avg. Repair Time</TableHead>
                      <TableHead>Quality Rating</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map(tech => (
                      <TableRow key={tech.name}>
                        <TableCell>{tech.name}</TableCell>
                        <TableCell>{tech.completed}</TableCell>
                        <TableCell>{tech.avgTime} min</TableCell>
                        <TableCell>
                          <span className={`font-medium ${tech.rating >= 4.8 ? 'text-green-600' : tech.rating >= 4.6 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {tech.rating}/5.0
                          </span>
                        </TableCell>
                        <TableCell>
                          {tech.rating >= 4.8 ? "Excellent technical skills" : tech.rating >= 4.6 ? "Good overall performance" : "Needs improvement in efficiency"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MaintenanceTypeReport = ({
  data = [],
  isLoading = false
}: {
  data?: any[];
  isLoading?: boolean;
}) => {
  // Show empty state with alert if no data and not loading
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4 text-center">Maintenance by Type</h3>
            <Alert className="bg-muted/50">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>No maintenance type data available</AlertTitle>
              <AlertDescription>
                Maintenance type analysis will appear here once sufficient maintenance tasks are recorded.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 py-[5px] mx-[3px] my-[3px] px-0">
          <h3 className="text-lg font-medium mb-4 text-center">Maintenance by Type</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data} 
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" name="Number of Tasks" fill="#3b82f6" />
                  <Bar yAxisId="right" dataKey="avgTime" name="Avg. Minutes" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Maintenance Type Analysis</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-700">120 min</h4>
                <p className="text-sm text-blue-600">Average plumbing repair time</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-green-700">35</h4>
                <p className="text-sm text-green-600">Most frequent: Plumbing issues</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-amber-700">160 min</h4>
                <p className="text-sm text-amber-600">Longest: Structural repairs</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceReporting;
