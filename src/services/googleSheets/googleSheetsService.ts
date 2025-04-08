
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SheetData {
  values: any[][];
  headers?: string[];
}

export interface SheetInfo {
  id: number;
  title: string;
  index: number;
  hidden: boolean;
}

export interface NamedRange {
  namedRangeId: string;
  name: string;
  range: {
    sheetId: number;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
  };
}

export interface BatchUpdateRequest {
  requests: object[];
}

export interface SheetMetadata {
  properties: {
    title: string;
  };
  sheets: {
    properties: {
      sheetId: number;
      title: string;
      index: number;
      sheetType: string;
      gridProperties: {
        rowCount: number;
        columnCount: number;
      };
      hidden?: boolean;
    };
  }[];
  namedRanges?: NamedRange[];
}

export interface SheetRelationship {
  name: string;
  sourceSpreadsheetId: string;
  sourceRange: string;
  targetSpreadsheetId?: string;
  targetRange: string;
  writeMode?: 'overwrite' | 'append';
  keyColumn?: string;
  transform?: SheetTransform;
  description?: string;
}

export interface SheetTransform {
  type: 'map' | 'filter' | 'aggregate' | 'join';
  config: Record<string, any>;
}

export interface SyncConfig {
  relationships: SheetRelationship[];
  options?: {
    createBackup?: boolean;
    validateBeforeSync?: boolean;
    notifyOnCompletion?: boolean;
  };
}

export interface ChangeLogEntry {
  operationType: string;
  spreadsheetId: string;
  range?: string;
  timestamp: string;
  updatedCells?: number;
  status: string;
  details?: Record<string, any>;
}

export class GoogleSheetsService {
  /**
   * Fetch data from a Google Sheet
   */
  static async fetchSheetData(
    spreadsheetId: string,
    range: string = "Sheet1"
  ): Promise<SheetData | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "GET",
          operation: "READ_SHEET",
          spreadsheetId,
          range,
        },
      });

      if (error) {
        console.error("Error fetching Google Sheet data:", error);
        toast.error("Failed to fetch sheet data", {
          description: error.message,
        });
        return null;
      }

      // Extract headers and values
      if (data?.data?.values && data.data.values.length > 0) {
        const headers = data.data.values[0];
        const values = data.data.values.slice(1);
        return { values: data.data.values, headers };
      }

      return { values: [] };
    } catch (error) {
      console.error("Error in fetchSheetData:", error);
      toast.error("Failed to fetch sheet data");
      return null;
    }
  }

  /**
   * Get a list of all sheets in a spreadsheet
   */
  static async getSheetsList(spreadsheetId: string): Promise<SheetInfo[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "GET",
          operation: "GET_SHEETS_LIST",
          spreadsheetId,
        },
      });

      if (error) {
        console.error("Error fetching sheets list:", error);
        toast.error("Failed to fetch sheets list", {
          description: error.message,
        });
        return null;
      }

      return data.sheets || [];
    } catch (error) {
      console.error("Error in getSheetsList:", error);
      toast.error("Failed to fetch sheets list");
      return null;
    }
  }

  /**
   * Get complete metadata about a spreadsheet
   */
  static async getSpreadsheetMetadata(spreadsheetId: string): Promise<SheetMetadata | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "GET",
          operation: "GET_SPREADSHEET_METADATA",
          spreadsheetId,
        },
      });

      if (error) {
        console.error("Error fetching spreadsheet metadata:", error);
        toast.error("Failed to fetch spreadsheet metadata", {
          description: error.message,
        });
        return null;
      }

      return data.metadata || null;
    } catch (error) {
      console.error("Error in getSpreadsheetMetadata:", error);
      toast.error("Failed to fetch spreadsheet metadata");
      return null;
    }
  }

  /**
   * Get named ranges in a spreadsheet
   */
  static async getNamedRanges(spreadsheetId: string): Promise<NamedRange[] | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "GET",
          operation: "GET_NAMED_RANGES",
          spreadsheetId,
        },
      });

      if (error) {
        console.error("Error fetching named ranges:", error);
        toast.error("Failed to fetch named ranges", {
          description: error.message,
        });
        return null;
      }

      return data.namedRanges || [];
    } catch (error) {
      console.error("Error in getNamedRanges:", error);
      toast.error("Failed to fetch named ranges");
      return null;
    }
  }

  /**
   * Check for changes since last sync
   */
  static async checkChanges(spreadsheetId: string): Promise<{
    changes: any[];
    lastChecked: string;
  } | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "GET",
          operation: "CHECK_CHANGES",
          spreadsheetId,
        },
      });

      if (error) {
        console.error("Error checking changes:", error);
        toast.error("Failed to check for changes", {
          description: error.message,
        });
        return null;
      }

      return {
        changes: data.changes || [],
        lastChecked: data.lastChecked
      };
    } catch (error) {
      console.error("Error in checkChanges:", error);
      toast.error("Failed to check for changes");
      return null;
    }
  }

  /**
   * Write data to a Google Sheet
   */
  static async writeToSheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "WRITE_SHEET",
          spreadsheetId,
          range,
          values,
        },
      });

      if (error) {
        console.error("Error writing to Google Sheet:", error);
        toast.error("Failed to update sheet data", {
          description: error.message,
        });
        return false;
      }

      toast.success("Sheet updated successfully", {
        description: `Updated ${data.updatedCells} cells`,
      });
      return true;
    } catch (error) {
      console.error("Error in writeToSheet:", error);
      toast.error("Failed to update sheet data");
      return false;
    }
  }

  /**
   * Append data to a Google Sheet
   */
  static async appendToSheet(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "APPEND_SHEET",
          spreadsheetId,
          range,
          values,
        },
      });

      if (error) {
        console.error("Error appending to Google Sheet:", error);
        toast.error("Failed to append data to sheet", {
          description: error.message,
        });
        return false;
      }

      toast.success("Data appended successfully");
      return true;
    } catch (error) {
      console.error("Error in appendToSheet:", error);
      toast.error("Failed to append data to sheet");
      return false;
    }
  }

  /**
   * Perform batch update operations on a Google Sheet
   */
  static async batchUpdate(
    spreadsheetId: string,
    batchRequests: object[]
  ): Promise<object | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "BATCH_UPDATE",
          spreadsheetId,
          batchRequests,
        },
      });

      if (error) {
        console.error("Error performing batch update:", error);
        toast.error("Failed to perform batch update", {
          description: error.message,
        });
        return null;
      }

      toast.success("Batch update completed successfully");
      return data.responses || {};
    } catch (error) {
      console.error("Error in batchUpdate:", error);
      toast.error("Failed to perform batch update");
      return null;
    }
  }

  /**
   * Create a named range in a Google Sheet
   */
  static async createNamedRange(
    spreadsheetId: string,
    name: string,
    rangeDefinition: {
      sheetId: number;
      startRowIndex: number;
      endRowIndex: number;
      startColumnIndex: number;
      endColumnIndex: number;
    }
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "CREATE_NAMED_RANGE",
          spreadsheetId,
          name,
          rangeDefinition,
        },
      });

      if (error) {
        console.error("Error creating named range:", error);
        toast.error("Failed to create named range", {
          description: error.message,
        });
        return null;
      }

      toast.success("Named range created successfully");
      return data.namedRangeId || null;
    } catch (error) {
      console.error("Error in createNamedRange:", error);
      toast.error("Failed to create named range");
      return null;
    }
  }

  /**
   * Clear data from a range in a Google Sheet
   */
  static async clearRange(
    spreadsheetId: string,
    range: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "CLEAR_RANGE",
          spreadsheetId,
          range,
        },
      });

      if (error) {
        console.error("Error clearing range:", error);
        toast.error("Failed to clear data", {
          description: error.message,
        });
        return false;
      }

      toast.success("Range cleared successfully");
      return true;
    } catch (error) {
      console.error("Error in clearRange:", error);
      toast.error("Failed to clear data");
      return false;
    }
  }

  /**
   * Create a backup of a Google Sheet by copying it
   */
  static async createBackup(
    spreadsheetId: string,
    backupTitle?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "CREATE_BACKUP",
          spreadsheetId,
          backupTitle: backupTitle || `Backup - ${new Date().toISOString().split('T')[0]}`,
        },
      });

      if (error) {
        console.error("Error creating backup:", error);
        toast.error("Failed to create backup", {
          description: error.message,
        });
        return null;
      }

      toast.success("Spreadsheet backup created successfully", {
        description: `Backup ID: ${data.backupSpreadsheetId}`,
      });
      return data.backupSpreadsheetId || null;
    } catch (error) {
      console.error("Error in createBackup:", error);
      toast.error("Failed to create backup");
      return null;
    }
  }

  /**
   * Import data from another Google Sheet
   */
  static async importFromAnotherSheet(
    sourceSpreadsheetId: string,
    sourceRange: string,
    targetSpreadsheetId: string,
    targetRange: string
  ): Promise<boolean> {
    try {
      // First, fetch the data from the source spreadsheet
      const sourceData = await this.fetchSheetData(sourceSpreadsheetId, sourceRange);
      
      if (!sourceData || sourceData.values.length === 0) {
        toast.error("No data to import");
        return false;
      }
      
      // Then write it to the target spreadsheet
      const success = await this.writeToSheet(
        targetSpreadsheetId,
        targetRange,
        sourceData.values
      );
      
      if (success) {
        toast.success("Data imported successfully");
      }
      
      return success;
    } catch (error) {
      console.error("Error importing from another sheet:", error);
      toast.error("Failed to import data");
      return false;
    }
  }

  /**
   * Synchronize sheets based on a sync configuration
   */
  static async synchronizeSheets(
    spreadsheetId: string,
    syncConfig: SyncConfig
  ): Promise<{
    success: boolean;
    partialSuccess?: boolean;
    results?: any[];
    errors?: any[];
  } | null> {
    try {
      // Create backup if requested
      if (syncConfig.options?.createBackup) {
        const backupTitle = `Backup before sync - ${new Date().toISOString().split('T')[0]}`;
        await this.createBackup(spreadsheetId, backupTitle);
      }
      
      // Validate relationships if requested
      if (syncConfig.options?.validateBeforeSync) {
        const validation = await this.validateRelationships(spreadsheetId, syncConfig.relationships);
        if (!validation?.allValid) {
          toast.error("Validation failed", {
            description: "Some relationships failed validation. Check the console for details."
          });
          console.error("Relationship validation failed:", validation?.validationResults);
          return null;
        }
      }
      
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "SYNC_SHEETS",
          spreadsheetId,
          syncConfig,
        },
      });

      if (error) {
        console.error("Error synchronizing sheets:", error);
        toast.error("Failed to synchronize sheets", {
          description: error.message,
        });
        return null;
      }

      if (data.errors && data.errors.length > 0) {
        if (data.partialSuccess) {
          toast.warning("Some synchronization operations failed", {
            description: `${data.results.length} succeeded, ${data.errors.length} failed`,
          });
        } else {
          toast.error("Failed to synchronize sheets", {
            description: `All ${data.errors.length} operations failed`,
          });
        }
      } else {
        toast.success("Sheets synchronized successfully", {
          description: `${data.results.length} operations completed`,
        });
      }
      
      if (syncConfig.options?.notifyOnCompletion) {
        // Here you could implement additional notification logic
        console.log("Sync completed, would send notification");
      }
      
      return {
        success: data.success,
        partialSuccess: data.partialSuccess,
        results: data.results,
        errors: data.errors
      };
    } catch (error) {
      console.error("Error in synchronizeSheets:", error);
      toast.error("Failed to synchronize sheets");
      return null;
    }
  }

  /**
   * Validate sheet relationships
   */
  static async validateRelationships(
    spreadsheetId: string,
    relationships: SheetRelationship[]
  ): Promise<{
    validationResults: { relationship: string; valid: boolean; error?: string }[];
    allValid: boolean;
  } | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-sheets", {
        body: {
          method: "POST",
          operation: "VALIDATE_RELATIONSHIPS",
          spreadsheetId,
          sheetRelationships: relationships,
        },
      });

      if (error) {
        console.error("Error validating relationships:", error);
        toast.error("Failed to validate sheet relationships", {
          description: error.message,
        });
        return null;
      }

      const { validationResults, allValid } = data;
      
      if (!allValid) {
        toast.warning("Some sheet relationships are invalid", {
          description: "Check the console for details"
        });
        console.warn("Invalid relationships:", validationResults.filter(r => !r.valid));
      } else {
        toast.success("All sheet relationships are valid");
      }
      
      return { validationResults, allValid };
    } catch (error) {
      console.error("Error in validateRelationships:", error);
      toast.error("Failed to validate sheet relationships");
      return null;
    }
  }
}
