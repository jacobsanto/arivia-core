
import React, { useState } from "react";
import { useUser } from "@/contexts/auth/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import GoogleSheetViewer from "@/components/googleSheets/GoogleSheetViewer";
import GoogleSheetForm from "@/components/googleSheets/GoogleSheetForm";

const GoogleSheetsIntegration = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("view");
  
  // Default example spreadsheet ID - replace with your own
  const exampleSpreadsheetId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms";
  const exampleRange = "Class Data!A1:E";
  
  const handleRefresh = () => {
    // This will be called after successfully submitting a form
    setActiveTab("view");
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Google Sheets Integration</h1>
        <p className="text-muted-foreground">
          Connect your Arivia Villas app with Google Sheets to import and export data
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="view">View Sheet Data</TabsTrigger>
          <TabsTrigger value="add">Add Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Sheet Viewer</CardTitle>
              <CardDescription>
                View data from a Google Sheet. You can enter any public spreadsheet ID and range.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSheetViewer
                spreadsheetId={exampleSpreadsheetId}
                range={exampleRange}
                title="Sample Google Sheet"
                description="Viewing data from a sample Google Sheet"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Data to Google Sheet</CardTitle>
              <CardDescription>
                Create a new entry in a Google Sheet by filling out the form below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSheetForm
                spreadsheetId={exampleSpreadsheetId}
                range={exampleRange}
                headers={["Name", "Gender", "Class Level", "Home State", "Major"]}
                onSuccess={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSheetsIntegration;
