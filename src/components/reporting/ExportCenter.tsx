import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, FileSpreadsheet, File, Calendar, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const ExportCenter = () => {
  const [exportType, setExportType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText, description: 'Professional formatted document' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Data analysis and calculations' },
    { value: 'csv', label: 'CSV Data', icon: File, description: 'Raw data for import/export' },
    { value: 'json', label: 'JSON Data', icon: File, description: 'Structured data format' }
  ];

  const exportTemplates = [
    { value: 'financial_summary', label: 'Financial Summary', category: 'Financial' },
    { value: 'occupancy_report', label: 'Occupancy Report', category: 'Operations' },
    { value: 'guest_analytics', label: 'Guest Analytics', category: 'Guest' },
    { value: 'maintenance_log', label: 'Maintenance Log', category: 'Maintenance' },
    { value: 'inventory_status', label: 'Inventory Status', category: 'Inventory' },
    { value: 'task_completion', label: 'Task Completion', category: 'Operations' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const properties = [
    'Villa Aurora', 'Villa Serenity', 'Villa Paradise', 'Villa Sunset', 'Villa Dreams'
  ];

  const recentExports = [
    {
      id: '1',
      name: 'Financial Summary - January 2024',
      type: 'PDF',
      size: '2.4 MB',
      status: 'completed',
      created: '2024-01-19 14:30',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: 'Guest Analytics - Q4 2023',
      type: 'Excel',
      size: '5.2 MB',
      status: 'completed',
      created: '2024-01-18 09:15',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: 'Occupancy Report - Weekly',
      type: 'CSV',
      size: '892 KB',
      status: 'processing',
      created: '2024-01-19 16:45',
      progress: 75
    },
    {
      id: '4',
      name: 'Maintenance Data Export',
      type: 'JSON',
      size: '1.1 MB',
      status: 'failed',
      created: '2024-01-19 12:20',
      error: 'Data source unavailable'
    }
  ];

  const toggleProperty = (property: string) => {
    setSelectedProperties(prev => 
      prev.includes(property) 
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  const startExport = () => {
    console.log('Starting export:', {
      type: exportType,
      dateRange,
      properties: selectedProperties
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing': return <Clock className="h-4 w-4 text-warning" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-muted-foreground" />
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-4">
            <Label>Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportFormats.map(format => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      exportType === format.value ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setExportType(format.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{format.label}</h4>
                        <p className="text-sm text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Template Selection */}
          <div className="space-y-4">
            <Label>Report Template</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a report template" />
              </SelectTrigger>
              <SelectContent>
                {exportTemplates.map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{template.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Date Range</Label>
                <div className="flex gap-2">
                  <Input type="date" placeholder="Start date" />
                  <Input type="date" placeholder="End date" />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Property Selection */}
          <div className="space-y-4">
            <Label>Properties to Include</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {properties.map(property => (
                <div key={property} className="flex items-center space-x-2">
                  <Checkbox
                    id={property}
                    checked={selectedProperties.includes(property)}
                    onCheckedChange={() => toggleProperty(property)}
                  />
                  <Label htmlFor={property} className="text-sm">
                    {property}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{selectedProperties.length} of {properties.length} properties selected</span>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setSelectedProperties(properties)}
              >
                Select All
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline">
                Preview Export
              </Button>
            </div>
            <Button onClick={startExport} disabled={!exportType}>
              <Download className="h-4 w-4 mr-2" />
              Start Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExports.map(exportItem => (
              <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(exportItem.status)}
                  <div>
                    <h4 className="font-medium text-foreground">{exportItem.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{exportItem.type}</span>
                      <span>•</span>
                      <span>{exportItem.size}</span>
                      <span>•</span>
                      <span>{exportItem.created}</span>
                    </div>
                    {exportItem.status === 'processing' && (
                      <Progress value={exportItem.progress} className="w-48 mt-2" />
                    )}
                    {exportItem.status === 'failed' && (
                      <p className="text-sm text-destructive mt-1">{exportItem.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(exportItem.status) as any}>
                    {exportItem.status}
                  </Badge>
                  {exportItem.status === 'completed' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">24</div>
            <div className="text-sm text-muted-foreground">Total Exports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">18</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">2</div>
            <div className="text-sm text-muted-foreground">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">45.2 MB</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};