
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GoogleSheetsService, SheetInfo } from "@/services/googleSheets/googleSheetsService";
import { Loader2, Plus, Trash, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BatchOperationFormProps {
  spreadsheetId: string;
  onSuccess?: () => void;
}

// Define common batch operation types with clearer descriptions
const BATCH_OPERATION_TYPES = [
  { value: "updateCells", label: "Update Cells", description: "Update values in specific cells or ranges" },
  { value: "appendCells", label: "Append Cells", description: "Add rows of data at the end of a sheet" },
  { value: "insertRows", label: "Insert Rows", description: "Insert empty rows at a specific position" },
  { value: "insertColumns", label: "Insert Columns", description: "Insert empty columns at a specific position" },
  { value: "deleteRows", label: "Delete Rows", description: "Remove rows from a specific position" },
  { value: "deleteColumns", label: "Delete Columns", description: "Remove columns from a specific position" },
  { value: "updateSheetProperties", label: "Update Sheet Properties", description: "Change sheet name, color, or visibility" },
  { value: "addProtectedRange", label: "Add Protected Range", description: "Protect a range of cells from editing" },
  { value: "createSheet", label: "Create Sheet", description: "Add a new sheet to the spreadsheet" },
  { value: "copySheet", label: "Copy Sheet", description: "Create a duplicate of an existing sheet" },
];

// Template operations for common tasks
const OPERATION_TEMPLATES = [
  {
    name: "Add New Sheet",
    description: "Creates a new sheet with the specified name",
    operations: [
      {
        type: "createSheet",
        payload: { properties: { title: "New Sheet" } }
      }
    ]
  },
  {
    name: "Append Row with Timestamp",
    description: "Adds a new row with current timestamp",
    operations: [
      {
        type: "appendCells",
        payload: { 
          sheetId: 0,
          rows: [{ values: [{ userEnteredValue: { stringValue: "=NOW()" } }, { userEnteredValue: { stringValue: "New Entry" } }] }],
          fields: "*"
        }
      }
    ]
  },
  {
    name: "Protect Header Row",
    description: "Makes the first row read-only",
    operations: [
      {
        type: "addProtectedRange",
        payload: {
          protectedRange: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 1000
            },
            description: "Protected header row",
            warningOnly: false
          }
        }
      }
    ]
  }
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
  const [activeTab, setActiveTab] = useState("builder");
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);

  // Fetch sheets list when component mounts
  useEffect(() => {
    const fetchSheets = async () => {
      setLoadingSheets(true);
      try {
        const sheetsList = await GoogleSheetsService.getSheetsList(spreadsheetId);
        if (sheetsList) {
          setSheets(sheetsList);
        }
      } catch (error) {
        console.error("Failed to load sheets:", error);
      } finally {
        setLoadingSheets(false);
      }
    };

    if (spreadsheetId) {
      fetchSheets();
    }
  }, [spreadsheetId]);

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
        defaultPayload = { 
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 1,
          rows: [{ 
            values: [{ 
              userEnteredValue: { stringValue: "Example value" } 
            }] 
          }] 
        };
        break;
      case "appendCells":
        defaultPayload = { 
          sheetId: 0, 
          rows: [{ 
            values: [{ 
              userEnteredValue: { stringValue: "New data" } 
            }] 
          }],
          fields: "*" 
        };
        break;
      case "insertRows":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1, inheritFromBefore: false };
        break;
      case "insertColumns":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1, inheritFromBefore: false };
        break;
      case "deleteRows":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "deleteColumns":
        defaultPayload = { sheetId: 0, startIndex: 0, endIndex: 1 };
        break;
      case "updateSheetProperties":
        defaultPayload = { 
          sheetId: 0, 
          properties: { 
            title: "", 
            hidden: false, 
            gridProperties: { rowCount: 1000, columnCount: 26 } 
          },
          fields: "title,hidden,gridProperties" 
        };
        break;
      case "addProtectedRange":
        defaultPayload = {
          protectedRange: {
            range: {
              sheetId: 0,
              startRowIndex: 0,
              endRowIndex: 10,
              startColumnIndex: 0,
              endColumnIndex: 5
            },
            description: "Protected Range",
            warningOnly: true
          }
        };
        break;
      case "createSheet":
        defaultPayload = { 
          properties: { 
            title: "New Sheet", 
            gridProperties: { rowCount: 1000, columnCount: 26 } 
          } 
        };
        break;
      case "copySheet":
        defaultPayload = {
          sourceSheetId: 0,
          insertSheetIndex: 0,
          newSheetName: "Copy of Sheet"
        };
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

  const handleSheetChange = (index: number, sheetId: number, sheetTitle: string) => {
    const newOperations = [...operations];
    newOperations[index].sheetId = sheetId;
    newOperations[index].sheetTitle = sheetTitle;
    
    // Update the sheetId in the payload too
    if (newOperations[index].payload.sheetId !== undefined ||
        (newOperations[index].payload.range && newOperations[index].payload.range.sheetId !== undefined)) {
      
      if (newOperations[index].payload.range) {
        newOperations[index].payload.range.sheetId = sheetId;
      } else {
        newOperations[index].payload.sheetId = sheetId;
      }
    } else if (newOperations[index].payload.protectedRange) {
      newOperations[index].payload.protectedRange.range.sheetId = sheetId;
    }
    
    setOperations(newOperations);
  };

  const handlePayloadChange = (index: number, key: string, value: any) => {
    const newOperations = [...operations];
    
    // Handle nested paths like 'range.startRowIndex'
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      if (!newOperations[index].payload[parentKey]) {
        newOperations[index].payload[parentKey] = {};
      }
      newOperations[index].payload[parentKey][childKey] = value;
    } else {
      newOperations[index].payload[key] = value;
    }
    
    setOperations(newOperations);
  };

  const applyTemplate = (template: typeof OPERATION_TEMPLATES[0]) => {
    setOperations(template.operations);
    toast.info(`Applied template: ${template.name}`);
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
                sheetId: operation.sheetId || operation.payload.sheetId,
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
              sheetId: operation.sheetId || operation.payload.sheetId,
              rows: operation.payload.rows || [],
              fields: operation.payload.fields || "*"
            }
          };
        case "insertRows":
          return {
            insertDimension: {
              range: {
                sheetId: operation.sheetId || operation.payload.sheetId,
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
                sheetId: operation.sheetId || operation.payload.sheetId,
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
                sheetId: operation.sheetId || operation.payload.sheetId,
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
                sheetId: operation.sheetId || operation.payload.sheetId,
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
                sheetId: operation.sheetId || operation.payload.sheetId,
                ...operation.payload.properties
              },
              fields: operation.payload.fields || "*"
            }
          };
        case "addProtectedRange":
          return {
            addProtectedRange: {
              ...operation.payload
            }
          };
        case "createSheet":
          return {
            addSheet: {
              properties: operation.payload.properties
            }
          };
        case "copySheet":
          return {
            duplicateSheet: {
              sourceSheetId: operation.payload.sourceSheetId,
              insertSheetIndex: operation.payload.insertSheetIndex,
              newSheetName: operation.payload.newSheetName
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

  // Render specific form fields based on operation type
  const renderOperationFields = (operation: BatchOperation, index: number) => {
    // Sheet selector is common for most operations
    const sheetSelector = (
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Sheet</label>
        <Select
          value={String(operation.sheetId || '')}
          onValueChange={(value) => {
            const sheet = sheets.find(s => s.id === parseInt(value));
            if (sheet) {
              handleSheetChange(index, sheet.id, sheet.title);
            }
          }}
          disabled={loadingSheets}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingSheets ? "Loading sheets..." : "Select sheet"} />
          </SelectTrigger>
          <SelectContent>
            {sheets.map((sheet) => (
              <SelectItem key={sheet.id} value={String(sheet.id)}>
                {sheet.title} {sheet.hidden && "(Hidden)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    switch (operation.type) {
      case "updateCells":
        return (
          <div className="space-y-3">
            {sheetSelector}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Start Row</label>
                <Input
                  type="number"
                  value={operation.payload.startRowIndex || 0}
                  onChange={(e) => handlePayloadChange(index, "startRowIndex", parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Row</label>
                <Input
                  type="number"
                  value={operation.payload.endRowIndex || 1}
                  onChange={(e) => handlePayloadChange(index, "endRowIndex", parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Start Column</label>
                <Input
                  type="number"
                  value={operation.payload.startColumnIndex || 0}
                  onChange={(e) => handlePayloadChange(index, "startColumnIndex", parseInt(e.target.value))}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Column</label>
                <Input
                  type="number"
                  value={operation.payload.endColumnIndex || 1}
                  onChange={(e) => handlePayloadChange(index, "endColumnIndex", parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cell Values (JSON)</label>
              <Textarea
                value={JSON.stringify(operation.payload.rows || [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handlePayloadChange(index, "rows", parsed);
                  } catch (err) {
                    // Allow partial input without updating
                  }
                }}
                placeholder={`[
  { 
    "values": [
      { "userEnteredValue": { "stringValue": "Hello" } },
      { "userEnteredValue": { "numberValue": 42 } }
    ]
  }
]`}
                className="font-mono text-sm h-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: Array of row objects with cell values
              </p>
            </div>
          </div>
        );

      case "createSheet":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Sheet Title</label>
              <Input
                value={(operation.payload.properties?.title as string) || ""}
                onChange={(e) => {
                  const newProperties = { ...(operation.payload.properties || {}), title: e.target.value };
                  handlePayloadChange(index, "properties", newProperties);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Row Count</label>
                <Input
                  type="number"
                  value={(operation.payload.properties?.gridProperties?.rowCount as number) || 1000}
                  onChange={(e) => {
                    const gridProps = { ...(operation.payload.properties?.gridProperties || {}), rowCount: parseInt(e.target.value) };
                    const newProperties = { ...(operation.payload.properties || {}), gridProperties: gridProps };
                    handlePayloadChange(index, "properties", newProperties);
                  }}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Column Count</label>
                <Input
                  type="number"
                  value={(operation.payload.properties?.gridProperties?.columnCount as number) || 26}
                  onChange={(e) => {
                    const gridProps = { ...(operation.payload.properties?.gridProperties || {}), columnCount: parseInt(e.target.value) };
                    const newProperties = { ...(operation.payload.properties || {}), gridProperties: gridProps };
                    handlePayloadChange(index, "properties", newProperties);
                  }}
                  min="1"
                />
              </div>
            </div>
          </div>
        );

      // Additional cases for other operations would be added here
      default:
        return (
          <div className="space-y-3">
            {sheetSelector}
            <div>
              <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
              <Textarea
                value={JSON.stringify(operation.payload, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setOperations(ops => {
                      const newOps = [...ops];
                      newOps[index].payload = parsed;
                      return newOps;
                    });
                  } catch (err) {
                    // Allow partial input without updating
                  }
                }}
                className="font-mono text-sm h-48"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Operations</CardTitle>
        <CardDescription>
          Execute multiple operations in a single request to Google Sheets
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="builder">Operation Builder</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="json">JSON Mode</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <TabsContent value="builder">
              <div className="space-y-4">
                {operations.map((operation, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={operation.type}
                        onValueChange={(value) => handleOperationTypeChange(index, value)}
                      >
                        <SelectTrigger className="w-[300px]">
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
                    
                    <div className="mt-2">
                      {BATCH_OPERATION_TYPES.find(t => t.value === operation.type)?.description && (
                        <p className="text-xs text-muted-foreground mb-3">
                          {BATCH_OPERATION_TYPES.find(t => t.value === operation.type)?.description}
                        </p>
                      )}
                      
                      {/* Render fields specific to this operation type */}
                      {renderOperationFields(operation, index)}
                    </div>
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
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPERATION_TEMPLATES.map((template, i) => (
                  <div key={i} className="border rounded-md p-4">
                    <h3 className="font-medium text-base">{template.name}</h3>
                    <p className="text-sm text-muted-foreground my-2">{template.description}</p>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => applyTemplate(template)}
                    >
                      Apply Template
                    </Button>
                  </div>
                ))}
              </div>
              
              <Alert className="mt-4" variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>About Templates</AlertTitle>
                <AlertDescription>
                  Templates provide pre-configured operations for common tasks. After applying a template,
                  you may need to adjust sheet IDs and other parameters to match your spreadsheet.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="json">
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
            </TabsContent>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Execute Batch Operations
            </Button>
          </CardFooter>
        </form>
      </Tabs>
    </Card>
  );
};

export default BatchOperationForm;
