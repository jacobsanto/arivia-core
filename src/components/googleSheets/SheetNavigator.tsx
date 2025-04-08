
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GoogleSheetsService, SheetInfo } from "@/services/googleSheets/googleSheetsService";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

interface SheetNavigatorProps {
  spreadsheetId: string;
  onSheetChange: (sheetTitle: string) => void;
  displayMode?: "tabs" | "dropdown" | "grouped";
  className?: string;
  initialSheet?: string;
}

// Type for grouped sheets
interface SheetGroup {
  name: string;
  sheets: SheetInfo[];
  expanded: boolean;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  
  // State for grouped mode
  const [sheetGroups, setSheetGroups] = useState<SheetGroup[]>([]);

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
          
          // Create sheet groups based on naming patterns
          if (displayMode === "grouped") {
            organizeSheetGroups(sortedSheets);
          }
          
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
  }, [spreadsheetId, initialSheet, onSheetChange, displayMode]);

  // Organize sheets into groups based on naming patterns
  const organizeSheetGroups = (sheetsList: SheetInfo[]) => {
    const groups: Record<string, SheetInfo[]> = {};
    
    // Try to identify groups by prefixes or other patterns
    sheetsList.forEach(sheet => {
      // Example: grouping by prefix before a dash or underscore
      const groupMatch = sheet.title.match(/^([^-_]+)[-_]/);
      const groupName = groupMatch ? groupMatch[1] : "Other";
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(sheet);
    });
    
    // Convert to array and mark all as expanded initially
    const groupsArray: SheetGroup[] = Object.entries(groups).map(([name, sheets]) => ({
      name,
      sheets,
      expanded: true
    }));
    
    setSheetGroups(groupsArray);
  };

  const handleSheetChange = (sheetTitle: string) => {
    setSelectedSheet(sheetTitle);
    onSheetChange(sheetTitle);
  };

  const toggleGroup = (groupName: string) => {
    setSheetGroups(groups => 
      groups.map(group => 
        group.name === groupName 
          ? { ...group, expanded: !group.expanded } 
          : group
      )
    );
  };

  const filteredSheets = sheets.filter(sheet => {
    // Filter by search term
    const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter by visibility
    const matchesVisibility = showHidden ? true : !sheet.hidden;
    return matchesSearch && matchesVisibility;
  });

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

  // Search and visibility controls
  const navigationControls = (
    <div className="flex items-center gap-2 mb-2">
      <div className="relative flex-grow">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sheets..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-8"
        />
        {searchTerm && (
          <button 
            className="absolute right-2 top-2.5"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="checkbox"
          id="show-hidden"
          checked={showHidden}
          onChange={() => setShowHidden(!showHidden)}
          className="mr-1"
        />
        <label htmlFor="show-hidden" className="text-xs">Show Hidden</label>
      </div>
    </div>
  );

  if (displayMode === "dropdown") {
    return (
      <div className={className}>
        {navigationControls}
        <Select value={selectedSheet} onValueChange={handleSheetChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a sheet" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {filteredSheets.map((sheet) => (
              <SelectItem 
                key={sheet.id} 
                value={sheet.title}
                disabled={!showHidden && sheet.hidden}
              >
                {sheet.title} {sheet.hidden && "(Hidden)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (displayMode === "grouped") {
    return (
      <div className={className}>
        {navigationControls}
        <div className="border rounded-md">
          {sheetGroups.map((group) => (
            <div key={group.name} className="border-b last:border-b-0">
              <button 
                className="flex items-center justify-between w-full p-2 text-left hover:bg-muted"
                onClick={() => toggleGroup(group.name)}
              >
                <span className="font-medium">{group.name}</span>
                {group.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {group.expanded && (
                <div className="pl-4 pr-2 pb-2 space-y-1">
                  {group.sheets
                    .filter(sheet => {
                      const matchesSearch = sheet.title.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesVisibility = showHidden ? true : !sheet.hidden;
                      return matchesSearch && matchesVisibility;
                    })
                    .map(sheet => (
                      <div 
                        key={sheet.id}
                        className={`
                          p-1.5 rounded-sm cursor-pointer
                          ${selectedSheet === sheet.title ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                          ${sheet.hidden ? 'opacity-60 italic' : ''}
                        `}
                        onClick={() => handleSheetChange(sheet.title)}
                      >
                        {sheet.title}
                        {sheet.hidden && <span className="ml-1 text-xs">(Hidden)</span>}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default to tabs display mode
  return (
    <div className={className}>
      {navigationControls}
      <Tabs value={selectedSheet} onValueChange={handleSheetChange}>
        <TabsList className="overflow-auto flex w-full h-10">
          {filteredSheets.map((sheet) => (
            <TabsTrigger key={sheet.id} value={sheet.title} disabled={!showHidden && sheet.hidden}>
              {sheet.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default SheetNavigator;
