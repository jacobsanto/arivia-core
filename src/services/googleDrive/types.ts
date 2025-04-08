
/**
 * Shared types for Google Drive integration
 */

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

export interface ExportOptions {
  sheetName?: string;
  folderId?: string;
  folderName?: string;
  spreadsheetTitle?: string;
}

export interface ExportResult {
  spreadsheetId: string;
  url: string;
}
