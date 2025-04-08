
/**
 * Main Google Drive integration service
 * Re-exports functionality from specialized sub-services
 */

// Export all types
export * from './types';

// Export folder operations
import { FolderService } from './folderService';
export const { 
  createFolder, 
  findFolder, 
  getOrCreateFolder 
} = FolderService;

// Export spreadsheet operations
import { SpreadsheetService } from './spreadsheetService';
export const { 
  createSpreadsheet, 
  updateSheetValues, 
  appendSheetValues 
} = SpreadsheetService;

// Export data export functionality
import { ExportService } from './exportService';
export const { exportData } = ExportService;

// Export as a namespace for backward compatibility
export const GoogleDriveService = {
  // Folder operations
  createFolder: FolderService.createFolder,
  findFolder: FolderService.findFolder,
  getOrCreateFolder: FolderService.getOrCreateFolder,
  
  // Spreadsheet operations
  createSpreadsheet: SpreadsheetService.createSpreadsheet,
  updateSheetValues: SpreadsheetService.updateSheetValues,
  appendSheetValues: SpreadsheetService.appendSheetValues,
  
  // Export operations
  exportData: ExportService.exportData
};
