
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SheetData {
  values: any[][];
  headers?: string[];
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
}
