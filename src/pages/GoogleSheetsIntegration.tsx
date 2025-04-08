
import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/auth/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, FileSpreadsheet, HelpCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import GoogleSheetViewer from "@/components/googleSheets/GoogleSheetViewer";
import GoogleSheetForm from "@/components/googleSheets/GoogleSheetForm";
import SheetNavigator from "@/components/googleSheets/SheetNavigator";
import BatchOperationForm from "@/components/googleSheets/BatchOperationForm";
import SheetRelationshipManager from "@/components/googleSheets/SheetRelationshipManager";
import SheetSynchronizer from "@/components/googleSheets/SheetSynchronizer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GoogleSheetsService, SheetRelationship } from "@/services/googleSheets/googleSheetsService";
import { toast } from "sonner";

const GoogleSheetsIntegration = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("view");
  
  // Spreadsheet configuration
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [activeSheet, setActiveSheet] = useState("");
  const [storedSpreadsheetId, setStoredSpreadsheetId] = useState("");
  const [relationships, setRelationships] = useState<SheetRelationship[]>([]);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);
  
  // Example spreadsheet ID - replace with your own
  const exampleSpreadsheetId = "1SX0Uxf1UNRb7d95kDQvcdL8KehQJbfncCxndtkRWtiI";
  
  // Load stored spreadsheet ID from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("arivia_spreadsheet_id");
    if (savedId) {
      setSpreadsheetId(savedId);
      setStoredSpreadsheetId(savedId);
      
      // Load last sync date if available
      const lastSync = localStorage.getItem(`last_sync_${savedId}`);
      if (lastSync) {
        setLastSyncDate(lastSync);
      }
    } else {
      setSpreadsheetId(exampleSpreadsheetId);
    }
  }, []);

  // Save spreadsheet ID to localStorage
  const saveSpreadsheetId = () => {
    if (!spreadsheetId.trim()) {
      toast.error("Spreadsheet ID cannot be empty");
      return;
    }
    
    localStorage.setItem("arivia_spreadsheet_id", spreadsheetId);
    setStoredSpreadsheetId(spreadsheetId);
    toast.success("Spreadsheet ID saved successfully");
    
    // Reset active sheet and check for changes
    setActiveSheet("");
    checkForChanges();
  };
  
  const handleSheetChange = (sheetTitle: string) => {
    setActiveSheet(sheetTitle);
  };
  
  const handleRefresh = () => {
    // This will be called after successfully submitting a form
    setActiveTab("view");
    checkForChanges();
  };
  
  const handleRelationshipsChange = (updatedRelationships: SheetRelationship[]) => {
    setRelationships(updatedRelationships);
  };
  
  const checkForChanges = async () => {
    if (!storedSpreadsheetId) return;
    
    try {
      const result = await GoogleSheetsService.checkChanges(storedSpreadsheetId);
      if (result) {
        setLastSyncDate(result.lastChecked);
        localStorage.setItem(`last_sync_${storedSpreadsheetId}`, result.lastChecked);
        
        if (result.changes.length > 0) {
          toast.info(`${result.changes.length} changes detected since last check`);
        }
      }
    } catch (error) {
      console.error("Error checking for changes:", error);
    }
  };
  
  const createBackup = async () => {
    if (!storedSpreadsheetId) {
      toast.error("No spreadsheet ID configured");
      return;
    }
    
    toast.loading("Creating backup...");
    
    try {
      const backupId = await GoogleSheetsService.createBackup(storedSpreadsheetId);
      if (backupId) {
        toast.success("Backup created successfully", {
          description: `Backup ID: ${backupId}`,
        });
      } else {
        toast.error("Failed to create backup");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup");
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Google Sheets Integration</h1>
        <p className="text-muted-foreground">
          Connect your Arivia Villas app with Google Sheets for two-way data synchronization
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Integration Setup Required</AlertTitle>
        <AlertDescription>
          To use this feature, you need to add your Google Sheets API credentials to Supabase secrets.
          Create a service account in Google Cloud Console, generate a key, and add it as a secret named "GOOGLE_SHEETS_CREDENTIALS".
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Spreadsheet Configuration</CardTitle>
          <CardDescription>
            Enter the ID of the Google Spreadsheet you want to work with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  placeholder="Enter Spreadsheet ID" 
                  value={spreadsheetId} 
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  className="flex-1"
                />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2 p-2">
                      <p className="text-sm font-medium">How to find your Spreadsheet ID:</p>
                      <p className="text-xs">
                        The Spreadsheet ID is the value between /d/ and /edit in the Google Sheets URL.
                      </p>
                      <p className="text-xs break-all">
                        Example: https://docs.google.com/spreadsheets/d/<span className="font-bold bg-primary/10 p-1 rounded">1SX0Uxf1UNRb7d95kDQvcdL8KehQJbfncCxndtkRWtiI</span>/edit
                      </p>
                      <p className="text-xs text-amber-500 mt-2">
                        Important: Enter only the ID, not the full URL
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button onClick={saveSpreadsheetId}>Save</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">⚠️ The Spreadsheet ID is just the ID portion, not the full URL.</p>
              <p>Example: For the URL "https://docs.google.com/spreadsheets/d/1SX0Uxf1UNRb7d95kDQvcdL8KehQJbfncCxndtkRWtiI/edit"</p>
              <p>The ID is: <span className="font-mono bg-muted px-1">1SX0Uxf1UNRb7d95kDQvcdL8KehQJbfncCxndtkRWtiI</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {storedSpreadsheetId && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="w-full md:w-3/4">
              <SheetNavigator 
                spreadsheetId={storedSpreadsheetId}
                onSheetChange={handleSheetChange}
                className="mb-4"
                displayMode="grouped" // Using the new grouped mode
              />
            </div>
            
            <div className="w-full md:w-1/4 flex flex-col gap-2">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Status</h3>
                  <Button variant="ghost" size="sm" onClick={checkForChanges} title="Check for changes">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Last check:</span>{" "}
                    {lastSyncDate ? new Date(lastSyncDate).toLocaleString() : "Never"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Active sheet:</span>{" "}
                    {activeSheet || "None"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Relationships:</span>{" "}
                    {relationships.length}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={createBackup}
                >
                  Create Backup
                </Button>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-[800px]">
              <TabsTrigger value="view">View Sheet</TabsTrigger>
              <TabsTrigger value="add">Add Data</TabsTrigger>
              <TabsTrigger value="batch">Batch Operations</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="sync">Synchronize</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Google Sheet Viewer</CardTitle>
                  <CardDescription>
                    View data from the Google Sheet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GoogleSheetViewer
                    spreadsheetId={storedSpreadsheetId}
                    range={activeSheet || "Sheet1"}
                    title={`Sheet: ${activeSheet || "Sheet1"}`}
                    description={`Viewing data from ${activeSheet || "Sheet1"}`}
                    enableRefresh={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="add" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add Data to Google Sheet</CardTitle>
                  <CardDescription>
                    Create a new entry in the Google Sheet by filling out the form below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GoogleSheetForm
                    spreadsheetId={storedSpreadsheetId}
                    range={activeSheet || "Sheet1"}
                    headers={[]} // We'll fetch headers dynamically
                    onSuccess={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="batch" className="mt-4">
              <BatchOperationForm
                spreadsheetId={storedSpreadsheetId}
                onSuccess={handleRefresh}
              />
              
              <Alert className="mt-4" variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Batch Operations</AlertTitle>
                <AlertDescription>
                  Batch operations allow you to perform multiple updates to your spreadsheet in a single API request.
                  This is useful for complex operations, bulk updates, or maintaining data consistency.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="relationships" className="mt-4">
              <SheetRelationshipManager 
                spreadsheetId={storedSpreadsheetId} 
                onRelationshipsChange={handleRelationshipsChange}
              />
              
              <Alert className="mt-4" variant="default">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Sheet Relationships</AlertTitle>
                <AlertDescription>
                  Define relationships between your sheets to enable automatic data synchronization.
                  Relationships specify how data should flow from one sheet to another.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="sync" className="mt-4">
              <SheetSynchronizer 
                spreadsheetId={storedSpreadsheetId}
                relationships={relationships}
              />
              
              <Alert className="mt-4" variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Sheet Synchronization</AlertTitle>
                <AlertDescription>
                  Synchronize data between your sheets based on defined relationships.
                  This ensures your data remains consistent across your spreadsheet.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>How to set up the Google Sheets integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a project in Google Cloud Console</li>
            <li>Enable the Google Sheets API</li>
            <li>Create a service account and generate a JSON key</li>
            <li>Add the JSON key to Supabase secrets as "GOOGLE_SHEETS_CREDENTIALS"</li>
            <li>Share your Google Sheet with the service account email address</li>
            <li>Make sure to give the service account "Editor" access to your spreadsheet</li>
            <li>For two-way synchronization, define relationships between your sheets</li>
            <li>Use the Synchronize tab to keep your sheet data updated</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsIntegration;
