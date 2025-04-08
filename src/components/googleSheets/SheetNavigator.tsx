
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GoogleSheetsService, SheetInfo } from "@/services/googleSheets/googleSheetsService";

interface SheetNavigatorProps {
  spreadsheetId: string;
  onSheetChange: (sheetTitle: string) => void;
  displayMode?: "tabs" | "dropdown";
  className?: string;
  initialSheet?: string;
}

const SheetNavigator = ({
  spreadsheetId,
  onSheetChange,
  displayMode = "tabs",
  className = "",
  initialSheet
}: SheetNavigatorProps) => {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>(initialSheet || "");

  useEffect(() => {
    const fetchSheetsList = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sheetsList = await GoogleSheetsService.getSheetsList(spreadsheetId);
        
        if (sheetsList) {
          // Sort sheets by index
          const sortedSheets = [...sheetsList].sort((a, b) => a.index - b.index);
          setSheets(sortedSheets);
          
          if (sortedSheets.length > 0 && !initialSheet) {
            // Select the first sheet if no initial sheet was provided
            setSelectedSheet(sortedSheets[0].title);
            onSheetChange(sortedSheets[0].title);
          } else if (initialSheet) {
            setSelectedSheet(initialSheet);
            onSheetChange(initialSheet);
          }
        } else {
          setError("Failed to load sheets");
        }
      } catch (e) {
        console.error("Error loading sheets list:", e);
        setError("An error occurred while loading sheets");
      } finally {
        setLoading(false);
      }
    };

    if (spreadsheetId) {
      fetchSheetsList();
    }
  }, [spreadsheetId, initialSheet, onSheetChange]);

  const handleSheetChange = (sheetTitle: string) => {
    setSelectedSheet(sheetTitle);
    onSheetChange(sheetTitle);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return <Badge variant="destructive">{error}</Badge>;
  }

  if (sheets.length === 0) {
    return <Badge>No sheets found</Badge>;
  }

  if (displayMode === "dropdown") {
    return (
      <div className={className}>
        <Select value={selectedSheet} onValueChange={handleSheetChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a sheet" />
          </SelectTrigger>
          <SelectContent>
            {sheets.map((sheet) => (
              <SelectItem key={sheet.id} value={sheet.title}>
                {sheet.title} {sheet.hidden && "(Hidden)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default to tabs display mode
  return (
    <div className={className}>
      <Tabs value={selectedSheet} onValueChange={handleSheetChange}>
        <TabsList className="overflow-auto flex w-full h-10">
          {sheets.map((sheet) => (
            <TabsTrigger key={sheet.id} value={sheet.title} disabled={sheet.hidden}>
              {sheet.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SheetNavigator;
