
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw } from "lucide-react";
import { GoogleSheetsService, SheetData } from "@/services/googleSheets/googleSheetsService";

interface GoogleSheetViewerProps {
  title?: string;
  description?: string;
  spreadsheetId: string;
  range?: string;
  refreshInterval?: number; // in milliseconds
  enableRefresh?: boolean;
}

const GoogleSheetViewer = ({
  title = "Google Sheet Data",
  description = "Data loaded from Google Sheets",
  spreadsheetId,
  range = "Sheet1",
  refreshInterval = 0,
  enableRefresh = true,
}: GoogleSheetViewerProps) => {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState<string>(spreadsheetId);
  const [customRange, setCustomRange] = useState<string>(range);

  const fetchData = async (sheetId = customSpreadsheetId, sheetRange = customRange) => {
    setLoading(true);
    setError(null);
    try {
      const result = await GoogleSheetsService.fetchSheetData(sheetId, sheetRange);
      if (result) {
        setData(result);
      } else {
        setError("Failed to load data from the Google Sheet");
      }
    } catch (e) {
      console.error("Error fetching sheet data:", e);
      setError("An error occurred while loading the data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(spreadsheetId, range);

    // Set up refresh interval if specified
    let intervalId: number | undefined;
    if (refreshInterval > 0) {
      intervalId = window.setInterval(() => {
        fetchData(customSpreadsheetId, customRange);
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [spreadsheetId, range, refreshInterval]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleCustomLoad = () => {
    fetchData(customSpreadsheetId, customRange);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        
        <div className="flex flex-col gap-2 mt-4 sm:flex-row">
          <Input
            placeholder="Spreadsheet ID"
            value={customSpreadsheetId}
            onChange={(e) => setCustomSpreadsheetId(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Range (e.g., Sheet1!A1:D10)"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleCustomLoad} disabled={loading}>
            Load
          </Button>
          
          {enableRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh data"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center text-destructive p-4">{error}</div>
        ) : !data || data.values.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">No data found</div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {data.values[0].map((header, index) => (
                    <TableHead key={index}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.values.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetViewer;
