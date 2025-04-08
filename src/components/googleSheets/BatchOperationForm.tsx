
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GoogleSheetsService } from "@/services/googleSheets/googleSheetsService";
import { Loader2, Plus, Trash } from "lucide-react";

interface BatchOperationFormProps {
  spreadsheetId: string;
  onSuccess?: () => void;
}

// Define common batch operation types
const BATCH_OPERATION_TYPES = [
  { value: "updateCells", label: "Update Cells" },
  { value: "appendCells", label: "Append Cells" },
  { value: "insertRows", label: "Insert Rows" },
  { value: "insertColumns", label: "Insert Columns" },
  { value: "deleteRows", label: "Delete Rows" },
  { value: "deleteColumns", label: "Delete Columns" },
  { value: "updateSheetProperties", label: "Update Sheet Properties" },
  { value: "createSheet", label: "Create Sheet" },
];

interface BatchOperation {
  type: string;
  sheetTitle?: string;
  sheetId?: number;
  payload: Record<string, any>;
}

const BatchOperationForm = ({ spreadsheetId, onSuccess }: BatchOperationFormProps) => {
  const [operations, setOperations] = useState<BatchOperation[]>([
    { type: "updateCells", payload: { range: "", values: [] } }
  ]);
  const [loading, setLoading] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonPayload, setJsonPayload] = useState('');

  const handleAddOperation = () => {
    setOperations([...operations, { type: "updateCells", payload: { range: "", values: [] } }]);
  };

  const handleRemoveOperation = (index: number) => {
    const newOperations = operations.filter((_, i) => i !== index);
    setOperations(newOperations);
  };

  const handleOperationTypeChange = (index: number, type: string) => {
    const newOperations = [...operations];
    
    // Set default payload based on operation type
    let defaultPayload: Record<string, any> = {};
    
    switch (type) {
      case "updateCells":
        defaultPayload = { range: "", values: [] };
        break;
      case "appendCells":
        defaultPayload = { range: "", values: [] };
        break;
      case "insertRows":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "insertColumns":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "deleteRows":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "deleteColumns":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "updateSheetProperties":
        defaultPayload = { sheetId: 0, properties: { title: "" } };
        break;
      case "createSheet":
        defaultPayload = { properties: { title: "New Sheet" } };
        break;
      default:
        defaultPayload = {};
    }
    
    newOperations[index] = {
      type,
      payload: defaultPayload
    };
    
    setOperations(newOperations);
  };

  const handlePayloadChange = (index: number, key: string, value: any) => {
    const newOperations = [...operations];
    newOperations[index].payload[key] = value;
    setOperations(newOperations);
  };

  const prepareBatchRequests = (): object[] => {
    if (jsonMode) {
      try {
        return JSON.parse(jsonPayload);
      } catch (e) {
        throw new Error("Invalid JSON payload. Please check your syntax.");
      }
    }

    return operations.map(operation => {
      switch (operation.type) {
        case "updateCells":
          return {
            updateCells: {
              range: {
                sheetId: operation.payload.sheetId,
                startRowIndex: operation.payload.startRowIndex,
                endRowIndex: operation.payload.endRowIndex,
                startColumnIndex: operation.payload.startColumnIndex,
                endColumnIndex: operation.payload.endColumnIndex
              },
              rows: operation.payload.rows || [],
              fields: operation.payload.fields || "*"
            }
          };
        case "appendCells":
          return {
            appendCells: {
              sheetId: operation.payload.sheetId,
              rows: operation.payload.rows || [],
              fields: operation.payload.fields || "*"
            }
          };
        case "insertRows":
          return {
            insertDimension: {
              range: {
                sheetId: operation.payload.sheetId,
                dimension: "ROWS",
                startIndex: operation.payload.startIndex,
                endIndex: operation.payload.endIndex
              },
              inheritFromBefore: operation.payload.inheritFromBefore
            }
          };
        case "insertColumns":
          return {
            insertDimension: {
              range: {
                sheetId: operation.payload.sheetId,
                dimension: "COLUMNS",
                startIndex: operation.payload.startIndex,
                endIndex: operation.payload.endIndex
              },
              inheritFromBefore: operation.payload.inheritFromBefore
            }
          };
        case "deleteRows":
          return {
            deleteDimension: {
              range: {
                sheetId: operation.payload.sheetId,
                dimension: "ROWS",
                startIndex: operation.payload.startIndex,
                endIndex: operation.payload.endIndex
              }
            }
          };
        case "deleteColumns":
          return {
            deleteDimension: {
              range: {
                sheetId: operation.payload.sheetId,
                dimension: "COLUMNS",
                startIndex: operation.payload.startIndex,
                endIndex: operation.payload.endIndex
              }
            }
          };
        case "updateSheetProperties":
          return {
            updateSheetProperties: {
              properties: {
                sheetId: operation.payload.sheetId,
                ...operation.payload.properties
              },
              fields: operation.payload.fields || "*"
            }
          };
        case "createSheet":
          return {
            addSheet: {
              properties: operation.payload.properties
            }
          };
        default:
          return {};
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (operations.length === 0 && !jsonMode) {
      toast.error("Please add at least one operation");
      return;
    }
    
    try {
      setLoading(true);
      const batchRequests = prepareBatchRequests();
      
      if (batchRequests.length === 0) {
        toast.error("No valid batch operations to perform");
        return;
      }
      
      const result = await GoogleSheetsService.batchUpdate(spreadsheetId, batchRequests);
      
      if (result) {
        toast.success("Batch operations completed successfully");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error submitting batch operations:", error);
      toast.error(error.message || "Failed to execute batch operations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Operations</CardTitle>
        <CardDescription>
          Execute multiple operations in a single request to Google Sheets
        </CardDescription>
        
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={jsonMode ? "outline" : "default"}
            size="sm"
            onClick={() => setJsonMode(false)}
          >
            Form Mode
          </Button>
          <Button
            variant={jsonMode ? "default" : "outline"}
            size="sm"
            onClick={() => setJsonMode(true)}
          >
            JSON Mode
          </Button>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {jsonMode ? (
            <div className="space-y-2">
              <Textarea 
                placeholder="Paste your batch requests JSON here..."
                className="h-[300px] font-mono text-sm"
                value={jsonPayload}
                onChange={(e) => setJsonPayload(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid JSON array of batch request objects following the Google Sheets API format.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {operations.map((operation, index) => (
                <div key={index} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Select
                      value={operation.type}
                      onValueChange={(value) => handleOperationTypeChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATCH_OPERATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOperation(index)}
                      disabled={operations.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Dynamic form fields based on operation type */}
                  {operation.type === "updateCells" && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Sheet ID"
                        type="number"
                        value={operation.payload.sheetId || ''}
                        onChange={(e) => handlePayloadChange(index, "sheetId", parseInt(e.target.value))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Start Row Index"
                          type="number"
                          value={operation.payload.startRowIndex || ''}
                          onChange={(e) => handlePayloadChange(index, "startRowIndex", parseInt(e.target.value))}
                        />
                        <Input
                          placeholder="End Row Index"
                          type="number"
                          value={operation.payload.endRowIndex || ''}
                          onChange={(e) => handlePayloadChange(index, "endRowIndex", parseInt(e.target.value))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Start Column Index"
                          type="number"
                          value={operation.payload.startColumnIndex || ''}
                          onChange={(e) => handlePayloadChange(index, "startColumnIndex", parseInt(e.target.value))}
                        />
                        <Input
                          placeholder="End Column Index"
                          type="number"
                          value={operation.payload.endColumnIndex || ''}
                          onChange={(e) => handlePayloadChange(index, "endColumnIndex", parseInt(e.target.value))}
                        />
                      </div>
                      <Textarea
                        placeholder="Cell Values (JSON array of row objects)"
                        value={JSON.stringify(operation.payload.rows || '[]')}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handlePayloadChange(index, "rows", parsed);
                          } catch (err) {
                            // Allow partial input without updating
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Similar field structures for other operation types */}
                  {/* The complete implementation would include all operation types */}
                  {/* Simplified for this example */}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOperation}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Operation
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Execute Batch Operations
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BatchOperationForm;
