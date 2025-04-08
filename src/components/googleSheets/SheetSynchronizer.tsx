
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GoogleSheetsService, SheetRelationship, SyncConfig } from "@/services/googleSheets/googleSheetsService";
import { AlertCircle, Check, Clock, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SheetSynchronizerProps {
  spreadsheetId: string;
  relationships: SheetRelationship[];
}

const SheetSynchronizer: React.FC<SheetSynchronizerProps> = ({
  spreadsheetId,
  relationships
}) => {
  const [syncing, setSyncing] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);
  const [validateBeforeSync, setValidateBeforeSync] = useState(true);
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    partialSuccess?: boolean;
    results?: any[];
    errors?: any[];
    timestamp: string;
  } | null>(null);

  const handleSynchronize = async () => {
    if (relationships.length === 0) {
      toast.warning("No relationships to synchronize");
      return;
    }
    
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const syncConfig: SyncConfig = {
        relationships,
        options: {
          createBackup,
          validateBeforeSync,
          notifyOnCompletion
        }
      };
      
      const result = await GoogleSheetsService.synchronizeSheets(
        spreadsheetId,
        syncConfig
      );
      
      if (result) {
        setSyncResult({
          ...result,
          timestamp: new Date().toISOString()
        });
        
        const successCount = result.results?.length || 0;
        const errorCount = result.errors?.length || 0;
        
        if (result.success) {
          toast.success(`Sync completed successfully`, {
            description: `${successCount} operations completed`
          });
        } else if (result.partialSuccess) {
          toast.warning(`Sync partially completed`, {
            description: `${successCount} succeeded, ${errorCount} failed`
          });
        } else {
          toast.error(`Sync failed`, {
            description: errorCount > 0 
              ? `All ${errorCount} operations failed` 
              : "Unknown error occurred"
          });
        }
      }
    } catch (e) {
      console.error("Error synchronizing sheets:", e);
      toast.error("Failed to synchronize sheets");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Sheet Synchronization
        </CardTitle>
        <CardDescription>
          Synchronize data between related sheets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relationships.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No relationships defined</AlertTitle>
              <AlertDescription>
                Create sheet relationships first to enable synchronization
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="create-backup" 
                    checked={createBackup}
                    onCheckedChange={(checked) => setCreateBackup(checked === true)}
                  />
                  <Label htmlFor="create-backup">Create backup before sync</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="validate-before-sync" 
                    checked={validateBeforeSync}
                    onCheckedChange={(checked) => setValidateBeforeSync(checked === true)}
                  />
                  <Label htmlFor="validate-before-sync">Validate relationships before sync</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="notify-on-completion" 
                    checked={notifyOnCompletion}
                    onCheckedChange={(checked) => setNotifyOnCompletion(checked === true)}
                  />
                  <Label htmlFor="notify-on-completion">Notify on completion</Label>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handleSynchronize}
                  disabled={syncing || relationships.length === 0}
                  className="w-full"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      Synchronize {relationships.length} Relationships
                    </>
                  )}
                </Button>
              </div>
              
              {syncResult && (
                <div className="mt-4">
                  <Alert variant={syncResult.success ? "default" : syncResult.partialSuccess ? "warning" : "destructive"}>
                    {syncResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {syncResult.success 
                        ? "Sync Completed Successfully" 
                        : syncResult.partialSuccess 
                        ? "Partial Success" 
                        : "Sync Failed"}
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        {syncResult.results?.length || 0} operations succeeded, {syncResult.errors?.length || 0} failed
                      </p>
                      <p className="text-xs">
                        Completed at: {new Date(syncResult.timestamp).toLocaleString()}
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                <h4 className="font-medium mb-2">Relationships to synchronize:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {relationships.map((relationship, index) => (
                    <li key={index}>
                      {relationship.name}: {relationship.sourceRange} → {relationship.targetRange} ({relationship.writeMode || "overwrite"})
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Last synced: {syncResult ? new Date(syncResult.timestamp).toLocaleString() : "Never"}
        </p>
        {relationships.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => console.log("View log")}>
            <FileText className="h-3.5 w-3.5 mr-1" />
            View Log
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SheetSynchronizer;
