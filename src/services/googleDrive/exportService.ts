
import { toast } from "sonner";
import { FolderService } from "./folderService";
import { SpreadsheetService } from "./spreadsheetService";
import { ExportOptions, ExportResult, TemplateType } from "./types";

/**
 * Service for exporting data to Google Sheets
 */
export class ExportService {
  /**
   * Export data from the app to a Google Sheet
   */
  static async exportData(
    data: any[],
    type: TemplateType,
    options?: ExportOptions
  ): Promise<ExportResult | null> {
    try {
      let folderId = options?.folderId;
      
      // If no folderId is provided, check if we should create/find by name
      if (!folderId && options?.folderName) {
        const folder = await FolderService.getOrCreateFolder(options.folderName);
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
      const spreadsheet = await SpreadsheetService.createSpreadsheet(title, folderId, type);
      
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
      await SpreadsheetService.updateSheetValues(
        spreadsheet.spreadsheetId, 
        `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`, 
        [headers]
      );
      
      // Then append the data
      if (rows.length > 0) {
        await SpreadsheetService.appendSheetValues(
          spreadsheet.spreadsheetId, 
          `${sheetName}!A2:${String.fromCharCode(65 + headers.length - 1)}`, 
          rows
        );
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
