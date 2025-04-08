
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Spreadsheet, TemplateType, UpdateSheetResult } from "./types";

/**
 * Service for Google Spreadsheet operations
 */
export class SpreadsheetService {
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
}
