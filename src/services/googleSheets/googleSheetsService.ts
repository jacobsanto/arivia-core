
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
}
