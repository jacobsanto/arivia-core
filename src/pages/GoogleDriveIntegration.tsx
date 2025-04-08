
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGoogleDrive } from "@/contexts/GoogleDriveContext";
import { Loader2, FolderPlus, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react";
import { useUser } from "@/contexts/auth/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateType } from "@/services/googleDrive/googleDriveService";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Sample data for demonstration purposes
const sampleData = {
  inventory: [
    { ID: "INV-001", Name: "Hand Soap", Category: "Cleaning", StockLevel: 20, MinStock: 5, MaxStock: 30, UnitCost: 2.99, LastUpdated: new Date().toISOString() },
    { ID: "INV-002", Name: "Towels", Category: "Linens", StockLevel: 50, MinStock: 20, MaxStock: 100, UnitCost: 5.99, LastUpdated: new Date().toISOString() }
  ],
  properties: [
    { ID: "PROP-001", Name: "Villa Azure", Address: "123 Beach Rd", City: "Mykonos", Country: "Greece", Type: "Villa", Bedrooms: 4, Bathrooms: 3, MaxGuests: 8, Status: "Active" },
    { ID: "PROP-002", Name: "Villa Sunset", Address: "456 Cliff Dr", City: "Santorini", Country: "Greece", Type: "Villa", Bedrooms: 3, Bathrooms: 2, MaxGuests: 6, Status: "Active" }
  ],
  maintenance: [
    { ID: "MAINT-001", Title: "Fix AC", PropertyID: "PROP-001", Description: "AC not cooling properly", Priority: "High", Status: "Pending", CreatedAt: new Date().toISOString(), DueDate: new Date(Date.now() + 86400000).toISOString(), AssignedTo: "John" },
    { ID: "MAINT-002", Title: "Replace Shower Head", PropertyID: "PROP-002", Description: "Low water pressure", Priority: "Medium", Status: "In Progress", CreatedAt: new Date().toISOString(), DueDate: new Date(Date.now() + 172800000).toISOString(), AssignedTo: "Maria" }
  ]
};

const GoogleDriveIntegration = () => {
  const { user } = useUser();
  const { 
    rootFolder, 
    isInitialized, 
    isLoading, 
    initializeRootFolder, 
    createSpreadsheet,
    spreadsheets,
    exportData
  } = useGoogleDrive();
  
  const [folderName, setFolderName] = useState<string>("Arivia Villas Data");
  const [spreadsheetName, setSpreadsheetName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [templateType, setTemplateType] = useState<TemplateType>("inventory");
  
  const handleInitializeFolder = async () => {
    await initializeRootFolder(folderName);
  };
  
  const handleCreateSpreadsheet = async () => {
    if (!spreadsheetName.trim()) {
      toast.error("Please enter a spreadsheet name");
      return;
    }
    
    const spreadsheet = await createSpreadsheet(spreadsheetName, templateType);
    if (spreadsheet) {
      setActiveTab("export");
    }
  };
  
  const handleExportData = async (type: TemplateType) => {
    let dataToExport;
    
    switch (type) {
      case "inventory":
        dataToExport = sampleData.inventory;
        break;
      case "properties":
        dataToExport = sampleData.properties;
        break;
      case "maintenance":
        dataToExport = sampleData.maintenance;
        break;
      default:
        toast.error("Invalid data type");
        return;
    }
    
    const success = await exportData(dataToExport, type);
    if (success) {
      // Switch to the view tab after export
      setActiveTab("view");
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Google Drive Integration</h1>
        <p className="text-muted-foreground">
          Connect your Arivia Villas app with Google Drive for seamless data synchronization
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Setup Required</AlertTitle>
        <AlertDescription>
          To use this feature, make sure your Google Drive API credentials are configured in Supabase secrets as "GOOGLE_SHEETS_CREDENTIALS".
          The service account needs permissions for Google Drive and Google Sheets APIs.
        </AlertDescription>
      </Alert>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="setup">
            1. Setup
          </TabsTrigger>
          <TabsTrigger value="create" disabled={!isInitialized}>
            2. Create Spreadsheets
          </TabsTrigger>
          <TabsTrigger value="export" disabled={!isInitialized}>
            3. Export Data
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!isInitialized}>
            4. View & Manage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Initialize Google Drive Integration</CardTitle>
              <CardDescription>
                First, set up a connection to your Google Drive by creating or selecting a folder
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInitialized ? (
                <div className="space-y-4">
                  <Alert variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Integration Initialized</AlertTitle>
                    <AlertDescription>
                      Your app is connected to the Google Drive folder:
                      <Badge className="ml-2">{rootFolder?.name}</Badge>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setActiveTab("create")}>
                      Continue to Create Spreadsheets
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Enter folder name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleInitializeFolder}
                      disabled={isLoading || !folderName.trim()}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Initialize
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    This will create or connect to an existing folder in your Google Drive where all spreadsheets will be stored.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Spreadsheets</CardTitle>
              <CardDescription>
                Create spreadsheets based on predefined templates for different data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Enter spreadsheet name"
                    value={spreadsheetName}
                    onChange={(e) => setSpreadsheetName(e.target.value)}
                    className="flex-1"
                  />
                  
                  <select 
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="inventory">Inventory Template</option>
                    <option value="properties">Properties Template</option>
                    <option value="maintenance">Maintenance Template</option>
                    <option value="tasks">Tasks Template</option>
                    <option value="custom">Custom Template</option>
                  </select>
                  
                  <Button 
                    onClick={handleCreateSpreadsheet}
                    disabled={isLoading || !spreadsheetName.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Create
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Template Information</h3>
                  {templateType === "inventory" && (
                    <div className="text-sm">
                      <p className="font-medium">Inventory Template includes:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Items sheet (ID, Name, Category, Stock Level, etc.)</li>
                        <li>Categories sheet (ID, Name, Description)</li>
                        <li>Vendors sheet (ID, Name, Contact, Email, etc.)</li>
                      </ul>
                    </div>
                  )}
                  
                  {templateType === "properties" && (
                    <div className="text-sm">
                      <p className="font-medium">Properties Template includes:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Properties sheet (ID, Name, Address, City, etc.)</li>
                        <li>Amenities sheet (PropertyID, Amenity, Description, Status)</li>
                        <li>PricingConfig sheet (PropertyID, Season, StartDate, etc.)</li>
                      </ul>
                    </div>
                  )}
                  
                  {templateType === "maintenance" && (
                    <div className="text-sm">
                      <p className="font-medium">Maintenance Template includes:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Tasks sheet (ID, Title, PropertyID, Description, etc.)</li>
                        <li>History sheet (TaskID, Action, Timestamp, User, Notes)</li>
                        <li>Tools sheet (TaskID, ToolName, Quantity, Notes)</li>
                      </ul>
                    </div>
                  )}
                  
                  {templateType === "tasks" && (
                    <div className="text-sm">
                      <p className="font-medium">Tasks Template includes:</p>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Tasks sheet (ID, Title, Description, Status, etc.)</li>
                        <li>Assignments sheet (TaskID, UserID, AssignedDate)</li>
                        <li>Comments sheet (TaskID, UserID, Comment, Timestamp)</li>
                      </ul>
                    </div>
                  )}
                  
                  {templateType === "custom" && (
                    <div className="text-sm">
                      <p className="font-medium">Custom Template:</p>
                      <p className="mt-2">Creates a simple spreadsheet with a single sheet.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export data from your app to Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Select Data to Export</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium">Inventory</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Export inventory items, categories, and vendors.
                      </p>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleExportData("inventory")}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Inventory
                      </Button>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-medium">Properties</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Export properties, amenities, and pricing configurations.
                      </p>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleExportData("properties")}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Properties
                      </Button>
                    </Card>
                    
                    <Card className="p-4">
                      <h4 className="font-medium">Maintenance</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Export maintenance tasks, history, and required tools.
                      </p>
                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleExportData("maintenance")}
                        disabled={isLoading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Maintenance
                      </Button>
                    </Card>
                  </div>
                </div>
                
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Processing...</p>
                  </div>
                )}
                
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>How Export Works</AlertTitle>
                  <AlertDescription>
                    <p>Data will be exported to Google Sheets in the following way:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>A new spreadsheet will be created in your Google Drive folder</li>
                      <li>The data will be formatted according to the selected template</li>
                      <li>You can access the exported data directly in Google Sheets</li>
                      <li>Updates to the app data can be re-exported at any time</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>View & Manage Spreadsheets</CardTitle>
              <CardDescription>
                Access and manage your Google Drive spreadsheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Your Spreadsheets</h3>
                
                {Object.entries(spreadsheets).filter(([_, id]) => id).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No spreadsheets created yet</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("create")}>
                      Create Spreadsheet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(spreadsheets).map(([type, id]) => {
                      if (!id) return null;
                      
                      return (
                        <div key={type} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <h4 className="font-medium capitalize">{type}</h4>
                            <p className="text-xs text-muted-foreground mt-1">ID: {id}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${id}`, '_blank')}>
                              Open
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleExportData(type as TemplateType)}>
                              Update
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-3">Integration Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border p-3 rounded">
                      <p className="text-sm text-muted-foreground">Root Folder:</p>
                      <p className="font-medium">{rootFolder?.name || "Not set"}</p>
                    </div>
                    <div className="border p-3 rounded">
                      <p className="text-sm text-muted-foreground">Folder ID:</p>
                      <p className="font-medium truncate">{rootFolder?.id || "N/A"}</p>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Google Drive Access</AlertTitle>
                  <AlertDescription>
                    <p>
                      Remember that your Google Drive files are only accessible to users with appropriate permissions.
                      To share spreadsheets with your team, use Google Drive's sharing features.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>How to set up the Google Drive integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a project in Google Cloud Console</li>
            <li>Enable the Google Drive API and Google Sheets API</li>
            <li>Create a service account and generate a JSON key</li>
            <li>Add the JSON key to Supabase secrets as "GOOGLE_SHEETS_CREDENTIALS"</li>
            <li>Initialize the integration by selecting or creating a folder in your Google Drive</li>
            <li>Create spreadsheets based on templates for different data types</li>
            <li>Export your app data to the created spreadsheets</li>
            <li>Access and manage your spreadsheets directly from Google Drive</li>
            <li>Updates to your app data can be re-exported at any time to keep the sheets in sync</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleDriveIntegration;
