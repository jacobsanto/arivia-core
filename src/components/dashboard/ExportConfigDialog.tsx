
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileDown, FileText, FileSpreadsheet, FileX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastService } from "@/services/toast/toast.service";

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ExportSection = 'properties' | 'tasks' | 'maintenance' | 'bookings' | 'activity' | 'system';

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: ExportFormat, sections: ExportSection[]) => void;
  isExporting: boolean;
  propertyFilter: string;
}

export const ExportConfigDialog: React.FC<ExportConfigDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  isExporting,
  propertyFilter
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [sections, setSections] = useState<ExportSection[]>([
    'properties', 'tasks', 'maintenance', 'bookings'
  ]);
  
  const toggleSection = (section: ExportSection) => {
    setSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  const handleExport = () => {
    if (sections.length === 0) {
      toastService.error("Please select at least one section to export");
      return;
    }
    
    onExport(format, sections);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Dashboard Report</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Export Format</h3>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv" className="flex items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>CSV</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel</span>
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileX className="h-4 w-4" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Data to Include</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="properties" 
                  checked={sections.includes('properties')}
                  onCheckedChange={() => toggleSection('properties')}
                />
                <Label htmlFor="properties" className="cursor-pointer">
                  Property Metrics
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="tasks" 
                  checked={sections.includes('tasks')}
                  onCheckedChange={() => toggleSection('tasks')}
                />
                <Label htmlFor="tasks" className="cursor-pointer">
                  Task Statistics
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="maintenance" 
                  checked={sections.includes('maintenance')}
                  onCheckedChange={() => toggleSection('maintenance')}
                />
                <Label htmlFor="maintenance" className="cursor-pointer">
                  Maintenance
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="bookings" 
                  checked={sections.includes('bookings')}
                  onCheckedChange={() => toggleSection('bookings')}
                />
                <Label htmlFor="bookings" className="cursor-pointer">
                  Bookings
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="activity" 
                  checked={sections.includes('activity')}
                  onCheckedChange={() => toggleSection('activity')}
                />
                <Label htmlFor="activity" className="cursor-pointer">
                  Activity Logs
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="system" 
                  checked={sections.includes('system')}
                  onCheckedChange={() => toggleSection('system')}
                />
                <Label htmlFor="system" className="cursor-pointer">
                  System Status
                </Label>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">
              {propertyFilter === 'all' 
                ? 'Data will include all properties' 
                : `Data will include only ${propertyFilter}`}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            className="flex items-center gap-2"
            disabled={isExporting || sections.length === 0}
          >
            <FileDown className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
