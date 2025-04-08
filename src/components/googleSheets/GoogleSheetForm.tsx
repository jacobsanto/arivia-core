
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { GoogleSheetsService } from "@/services/googleSheets/googleSheetsService";
import { toast } from "sonner";

interface GoogleSheetFormProps {
  title?: string;
  description?: string;
  spreadsheetId: string;
  range?: string;
  headers?: string[];
  onSuccess?: () => void;
}

const GoogleSheetForm = ({
  title = "Add Data to Google Sheet",
  description = "Fill out the form to add a new row to the Google Sheet",
  spreadsheetId,
  range = "Sheet1",
  headers = [],
  onSuccess,
}: GoogleSheetFormProps) => {
  const [loading, setLoading] = useState(false);
  const [customHeaders, setCustomHeaders] = useState<string[]>(headers.length > 0 ? headers : ["", ""]);
  const [rowData, setRowData] = useState<string[]>(Array(customHeaders.length).fill(""));

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, ""]);
    setRowData([...rowData, ""]);
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = customHeaders.filter((_, i) => i !== index);
    const newRowData = rowData.filter((_, i) => i !== index);
    setCustomHeaders(newHeaders);
    setRowData(newRowData);
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...customHeaders];
    newHeaders[index] = value;
    setCustomHeaders(newHeaders);
  };

  const handleDataChange = (index: number, value: string) => {
    const newRowData = [...rowData];
    newRowData[index] = value;
    setRowData(newRowData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (customHeaders.some(h => !h.trim())) {
      toast.error("All headers must be filled");
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for submission
      // If this is the first entry, include headers
      let success: boolean;
      
      if (headers.length === 0) {
        // This might be a new sheet, so append headers first
        success = await GoogleSheetsService.appendToSheet(
          spreadsheetId,
          range,
          [customHeaders, rowData]
        );
      } else {
        // Just append the row data
        success = await GoogleSheetsService.appendToSheet(
          spreadsheetId,
          range,
          [rowData]
        );
      }
      
      if (success) {
        setRowData(Array(customHeaders.length).fill(""));
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            {customHeaders.length === 0 ? (
              <div className="text-center py-4">
                <Button type="button" onClick={handleAddHeader}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            ) : (
              customHeaders.map((header, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    placeholder="Column Name"
                    value={header}
                    onChange={(e) => handleHeaderChange(index, e.target.value)}
                    disabled={headers.length > 0}
                  />
                  <Input
                    placeholder="Value"
                    value={rowData[index]}
                    onChange={(e) => handleDataChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveHeader(index)}
                    disabled={customHeaders.length <= 1 || headers.length > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            
            {headers.length === 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddHeader}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading || customHeaders.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GoogleSheetForm;
