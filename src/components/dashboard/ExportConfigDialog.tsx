
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ExportSection = 'properties' | 'tasks' | 'maintenance' | 'bookings';

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
  propertyFilter,
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>([
    'properties', 'tasks', 'maintenance', 'bookings'
  ]);

  const handleSectionToggle = (section: ExportSection) => {
    setSelectedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleExport = () => {
    if (selectedSections.length > 0) {
      onExport(format, selectedSections);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
          <DialogDescription>
            Select data sections and format for export.
            {propertyFilter !== 'all' && (
              <span className="block mt-1">
                Exporting data for property: <strong>{propertyFilter}</strong>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data to Export</h3>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="properties"
                  checked={selectedSections.includes('properties')}
                  onCheckedChange={() => handleSectionToggle('properties')}
                />
                <Label htmlFor="properties">Properties Data</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tasks"
                  checked={selectedSections.includes('tasks')}
                  onCheckedChange={() => handleSectionToggle('tasks')}
                />
                <Label htmlFor="tasks">Tasks & Housekeeping</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="maintenance"
                  checked={selectedSections.includes('maintenance')}
                  onCheckedChange={() => handleSectionToggle('maintenance')}
                />
                <Label htmlFor="maintenance">Maintenance Records</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bookings"
                  checked={selectedSections.includes('bookings')}
                  onCheckedChange={() => handleSectionToggle('bookings')}
                />
                <Label htmlFor="bookings">Booking Information</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select 
              value={format} 
              onValueChange={(value: ExportFormat) => setFormat(value)}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedSections.length === 0 || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              `Export as ${format.toUpperCase()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
