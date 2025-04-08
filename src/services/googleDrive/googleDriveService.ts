
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

export interface Spreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
    spreadsheetUrl: string;
    [key: string]: any;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

export type TemplateType = "inventory" | "properties" | "maintenance" | "tasks" | "custom";

export interface UpdateSheetResult {
  updatedRange: string;
  updatedRows: number;
  updatedColumns: number;
  updatedCells: number;
}

export class GoogleDriveService {
  /**
   * Create a new folder in Google Drive
   */
  static async createFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-drive", {
        body: {
          name,
          parentId,
          operation: "create-folder"
        },
      });

      if (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder", {
          description: error.message,
        });
        return null;
      }

      toast.success("Folder created successfully");
      return data.folder;
    } catch (error) {
      console.error("Error in createFolder:", error);
      toast.error("Failed to create folder");
      return null;
    }
  }

  /**
   * Find a folder by name
   */
  static async findFolder(name: string): Promise<DriveFolder | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-drive", {
        body: {
          name,
          operation: "find-folder"
        },
      });

      if (error) {
        console.error("Error finding folder:", error);
        toast.error("Failed to find folder", {
          description: error.message,
        });
        return null;
      }

      return data.folder;
    } catch (error) {
      console.error("Error in findFolder:", error);
      toast.error("Failed to find folder");
      return null;
    }
  }

  /**
   * Get or create a folder by name
   */
  static async getOrCreateFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    const folder = await this.findFolder(name);
    if (folder) {
      return folder;
    }
    return await this.createFolder(name, parentId);
  }

  /**
   * Create a new spreadsheet in a Google Drive folder
   */
  static async createSpreadsheet(
    title: string, 
    folderId: string, 
    template: TemplateType = "custom"
  ): Promise<Spreadsheet | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-drive", {
        body: {
          title,
          folderId,
          template,
          operation: "create-spreadsheet"
        },
      });

      if (error) {
        console.error("Error creating spreadsheet:", error);
        toast.error("Failed to create spreadsheet", {
          description: error.message,
        });
        return null;
      }

      toast.success("Spreadsheet created successfully");
      return data.spreadsheet;
    } catch (error) {
      console.error("Error in createSpreadsheet:", error);
      toast.error("Failed to create spreadsheet");
      return null;
    }
  }

  /**
   * Update values in a Google Sheet
   */
  static async updateSheetValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<UpdateSheetResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-drive", {
        body: {
          spreadsheetId,
          range,
          values,
          operation: "update-sheet"
        },
      });

      if (error) {
        console.error("Error updating sheet:", error);
        toast.error("Failed to update sheet", {
          description: error.message,
        });
        return null;
      }

      toast.success("Sheet updated successfully");
      return data.result;
    } catch (error) {
      console.error("Error in updateSheetValues:", error);
      toast.error("Failed to update sheet");
      return null;
    }
  }

  /**
   * Append values to a Google Sheet
   */
  static async appendSheetValues(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<any | null> {
    try {
      const { data, error } = await supabase.functions.invoke("google-drive", {
        body: {
          spreadsheetId,
          range,
          values,
          operation: "append-sheet"
        },
      });

      if (error) {
        console.error("Error appending values:", error);
        toast.error("Failed to append values", {
          description: error.message,
        });
        return null;
      }

      toast.success("Values appended successfully");
      return data.result;
    } catch (error) {
      console.error("Error in appendSheetValues:", error);
      toast.error("Failed to append values");
      return null;
    }
  }

  /**
   * Export data from the app to a Google Sheet
   */
  static async exportData(
    data: any[],
    type: TemplateType,
    options?: {
      sheetName?: string;
      folderId?: string;
      folderName?: string;
      spreadsheetTitle?: string;
    }
  ): Promise<{ spreadsheetId: string; url: string } | null> {
    try {
      let folderId = options?.folderId;
      
      // If no folderId is provided, check if we should create/find by name
      if (!folderId && options?.folderName) {
        const folder = await this.getOrCreateFolder(options.folderName);
        if (folder) {
          folderId = folder.id;
        } else {
          throw new Error("Failed to find or create folder");
        }
      }
      
      // If we still don't have a folderId, use the root of the drive
      if (!folderId) {
        folderId = "root";
      }
      
      // Create a spreadsheet with the appropriate template
      const title = options?.spreadsheetTitle || `${type.charAt(0).toUpperCase() + type.slice(1)} Export`;
      const spreadsheet = await this.createSpreadsheet(title, folderId, type);
      
      if (!spreadsheet) {
        throw new Error("Failed to create spreadsheet");
      }
      
      // Determine the sheet to use for the data
      let sheetName = options?.sheetName;
      if (!sheetName && spreadsheet.sheets && spreadsheet.sheets.length > 0) {
        sheetName = spreadsheet.sheets[0].properties.title;
      }
      
      if (!sheetName) {
        throw new Error("No valid sheet found in the spreadsheet");
      }
      
      // Convert data to the format Google Sheets expects
      // Skip the first row which should be headers
      const headers = Object.keys(data[0] || {});
      const rows = data.map(item => headers.map(key => item[key]));
      
      // First, make sure the headers are set properly
      await this.updateSheetValues(spreadsheet.spreadsheetId, `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`, [headers]);
      
      // Then append the data
      if (rows.length > 0) {
        await this.appendSheetValues(spreadsheet.spreadsheetId, `${sheetName}!A2:${String.fromCharCode(65 + headers.length - 1)}`, rows);
      }
      
      return {
        spreadsheetId: spreadsheet.spreadsheetId,
        url: spreadsheet.properties.spreadsheetUrl
      };
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
      return null;
    }
  }
}
