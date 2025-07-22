
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Table, BarChart3 } from 'lucide-react';

export const ExportCenter = () => {
  const [exportFormat, setExportFormat] = useState('');
  const [selectedData, setSelectedData] = useState<string[]>([]);

  const exportFormats = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: Table },
    { value: 'csv', label: 'CSV Data', icon: Table },
    { value: 'charts', label: 'Chart Images', icon: BarChart3 },
  ];

  const dataTypes = [
    { id: 'housekeeping', label: 'Housekeeping Data' },
    { id: 'maintenance', label: 'Maintenance Records' },
    { id: 'properties', label: 'Property Information' },
    { id: 'inventory', label: 'Inventory Usage' },
    { id: 'analytics', label: 'Analytics Summary' },
  ];

  const handleDataToggle = (dataId: string) => {
    setSelectedData(prev => 
      prev.includes(dataId) 
        ? prev.filter(id => id !== dataId)
        : [...prev, dataId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-muted-foreground" />
          Export Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Choose export format" />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map(format => {
                const Icon = format.icon;
                return (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {format.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Data to Include</Label>
          <div className="space-y-2">
            {dataTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={selectedData.includes(type.id)}
                  onCheckedChange={() => handleDataToggle(type.id)}
                />
                <Label htmlFor={type.id} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Export Preview</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Format: {exportFormat ? exportFormats.find(f => f.value === exportFormat)?.label : 'Not selected'}</p>
            <p>Data types: {selectedData.length} selected</p>
            <p>Estimated size: ~2-5 MB</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex items-center gap-2 flex-1"
            disabled={!exportFormat || selectedData.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline">
            Preview
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Recent Exports</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Operations_Report_2024-01-22.pdf</span>
              <Button size="sm" variant="ghost">
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Analytics_Data_2024-01-21.xlsx</span>
              <Button size="sm" variant="ghost">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
