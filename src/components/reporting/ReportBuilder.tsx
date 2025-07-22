
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Play, Save } from 'lucide-react';

export const ReportBuilder = () => {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');

  const reportTypes = [
    { value: 'housekeeping', label: 'Housekeeping Performance' },
    { value: 'maintenance', label: 'Maintenance Overview' },
    { value: 'properties', label: 'Property Analytics' },
    { value: 'inventory', label: 'Inventory Management' },
    { value: 'financial', label: 'Financial Summary' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          Custom Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
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

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this report should include..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Report Configuration</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Configure data sources, filters, and output format for your custom report.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>• Select date ranges and property filters</p>
            <p>• Choose metrics and KPIs to include</p>
            <p>• Set up automated scheduling</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
