import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Settings, Play } from 'lucide-react';

export const ReportBuilder = () => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);

  const reportTypes = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'operations', label: 'Operations Report' },
    { value: 'guest', label: 'Guest Analytics' },
    { value: 'maintenance', label: 'Maintenance Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const availableFields = {
    financial: [
      'revenue', 'expenses', 'profit_margin', 'booking_value', 'channel_fees', 'occupancy_rate'
    ],
    operations: [
      'check_ins', 'check_outs', 'task_completion', 'response_time', 'efficiency_score'
    ],
    guest: [
      'satisfaction_score', 'reviews', 'repeat_guests', 'booking_source', 'guest_demographics'
    ],
    maintenance: [
      'task_completion', 'response_time', 'cost_analysis', 'equipment_status', 'work_orders'
    ],
    inventory: [
      'stock_levels', 'usage_rates', 'reorder_points', 'cost_tracking', 'supplier_performance'
    ]
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, key: string, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [key]: value };
    setFilters(newFilters);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const generateReport = () => {
    console.log('Generating report:', {
      name: reportName,
      type: reportType,
      fields: selectedFields,
      filters
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Field Selection */}
        {reportType && (
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Select Data Fields</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableFields[reportType as keyof typeof availableFields]?.map(field => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <Label htmlFor={field} className="text-sm capitalize">
                    {field.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
            {selectedFields.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFields.map(field => (
                  <Badge key={field} variant="secondary" className="capitalize">
                    {field.replace(/_/g, ' ')}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => toggleField(field)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Filters</h4>
            <Button size="sm" variant="outline" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
          
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
              <Select 
                value={filter.field} 
                onValueChange={(value) => updateFilter(index, 'field', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filter.operator} 
                onValueChange={(value) => updateFilter(index, 'operator', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater than</SelectItem>
                  <SelectItem value="less_than">Less than</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                className="flex-1"
              />
              
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeFilter(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline">
              Save Template
            </Button>
            <Button variant="outline">
              Schedule Report
            </Button>
          </div>
          <Button onClick={generateReport} disabled={!reportName || !reportType || selectedFields.length === 0}>
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};