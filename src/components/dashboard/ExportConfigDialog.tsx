
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

export type ExportFormat = "csv" | "excel" | "pdf";
export type ExportSection = "properties" | "tasks" | "maintenance" | "bookings";

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
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [selectedSections, setSelectedSections] = useState<ExportSection[]>([
    "properties", "tasks", "maintenance", "bookings"
  ]);

  const handleSectionToggle = (section: ExportSection) => {
    setSelectedSections(current => {
      if (current.includes(section)) {
        return current.filter(s => s !== section);
      } else {
        return [...current, section];
      }
    });
  };

  const handleExport = () => {
    if (selectedSections.length === 0) return;
    onExport(format, selectedSections);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Dashboard Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Export Format</h3>
            <RadioGroup defaultValue={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel">Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf">PDF</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3">Include Sections</h3>
            <Card className="border border-muted">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="properties" 
                      checked={selectedSections.includes("properties")}
                      onCheckedChange={() => handleSectionToggle("properties")}
                    />
                    <Label htmlFor="properties">Properties</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tasks" 
                      checked={selectedSections.includes("tasks")}
                      onCheckedChange={() => handleSectionToggle("tasks")}
                    />
                    <Label htmlFor="tasks">Cleaning Tasks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="maintenance" 
                      checked={selectedSections.includes("maintenance")}
                      onCheckedChange={() => handleSectionToggle("maintenance")}
                    />
                    <Label htmlFor="maintenance">Maintenance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bookings" 
                      checked={selectedSections.includes("bookings")}
                      onCheckedChange={() => handleSectionToggle("bookings")}
                    />
                    <Label htmlFor="bookings">Bookings</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              {propertyFilter === "all" ? "All Properties" : propertyFilter}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting || selectedSections.length === 0}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
