
import React, { createContext, useContext, useState, useEffect } from "react";
import { GoogleDriveService, TemplateType, DriveFolder, Spreadsheet } from "@/services/googleDrive/googleDriveService";
import { toast } from "sonner";

interface GoogleDriveContextType {
  rootFolder: DriveFolder | null;
  activeSpreadsheet: Spreadsheet | null;
  spreadsheets: Record<TemplateType, string | null>;
  isInitialized: boolean;
  isLoading: boolean;
  
  // Folder operations
  initializeRootFolder: (folderName: string) => Promise<DriveFolder | null>;
  
  // Spreadsheet operations
  createSpreadsheet: (title: string, template: TemplateType) => Promise<Spreadsheet | null>;
  setActiveSpreadsheet: (spreadsheet: Spreadsheet | null) => void;
  
  // Export operations
  exportData: <T>(data: T[], type: TemplateType, options?: { sheetName?: string }) => Promise<boolean>;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rootFolder, setRootFolder] = useState<DriveFolder | null>(null);
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<Spreadsheet | null>(null);
  const [spreadsheets, setSpreadsheets] = useState<Record<TemplateType, string | null>>({
    inventory: null,
    properties: null,
    maintenance: null,
    tasks: null,
    custom: null
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Attempt to load the root folder on startup
  useEffect(() => {
    const loadRootFolder = async () => {
      const rootFolderName = localStorage.getItem("arivia_drive_root_folder");
      if (rootFolderName) {
        setIsLoading(true);
        try {
          const folder = await GoogleDriveService.findFolder(rootFolderName);
          if (folder) {
            setRootFolder(folder);
            setIsInitialized(true);
          }
        } catch (error) {
          console.error("Error loading root folder:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRootFolder();
  }, []);
  
  // Load spreadsheet IDs from localStorage
  useEffect(() => {
    const loadSpreadsheetIds = () => {
      const savedSpreadsheets: Record<TemplateType, string | null> = {
        inventory: localStorage.getItem("arivia_spreadsheet_inventory"),
        properties: localStorage.getItem("arivia_spreadsheet_properties"),
        maintenance: localStorage.getItem("arivia_spreadsheet_maintenance"),
        tasks: localStorage.getItem("arivia_spreadsheet_tasks"),
        custom: localStorage.getItem("arivia_spreadsheet_custom")
      };
      
      setSpreadsheets(savedSpreadsheets);
    };
    
    loadSpreadsheetIds();
  }, []);
  
  const initializeRootFolder = async (folderName: string): Promise<DriveFolder | null> => {
    setIsLoading(true);
    try {
      const folder = await GoogleDriveService.getOrCreateFolder(folderName);
      if (folder) {
        setRootFolder(folder);
        setIsInitialized(true);
        localStorage.setItem("arivia_drive_root_folder", folderName);
        return folder;
      }
      return null;
    } catch (error) {
      console.error("Error initializing root folder:", error);
      toast.error("Failed to initialize root folder");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const createSpreadsheet = async (title: string, template: TemplateType): Promise<Spreadsheet | null> => {
    if (!rootFolder) {
      toast.error("Root folder not initialized");
      return null;
    }
    
    setIsLoading(true);
    try {
      const spreadsheet = await GoogleDriveService.createSpreadsheet(title, rootFolder.id, template);
      if (spreadsheet) {
        setActiveSpreadsheet(spreadsheet);
        
        // Save the spreadsheet ID for this template type
        const newSpreadsheets = { ...spreadsheets };
        newSpreadsheets[template] = spreadsheet.spreadsheetId;
        setSpreadsheets(newSpreadsheets);
        localStorage.setItem(`arivia_spreadsheet_${template}`, spreadsheet.spreadsheetId);
        
        return spreadsheet;
      }
      return null;
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      toast.error("Failed to create spreadsheet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportData = async <T,>(
    data: T[],
    type: TemplateType,
    options?: { sheetName?: string }
  ): Promise<boolean> => {
    if (!rootFolder) {
      toast.error("Root folder not initialized");
      return false;
    }
    
    setIsLoading(true);
    try {
      const result = await GoogleDriveService.exportData(data, type, {
        folderId: rootFolder.id,
        sheetName: options?.sheetName
      });
      
      if (result) {
        // Update the active spreadsheet reference
        const newSpreadsheets = { ...spreadsheets };
        newSpreadsheets[type] = result.spreadsheetId;
        setSpreadsheets(newSpreadsheets);
        localStorage.setItem(`arivia_spreadsheet_${type}`, result.spreadsheetId);
        
        toast.success("Data exported successfully", {
          description: "Click to open the spreadsheet",
          action: {
            label: "Open",
            onClick: () => window.open(result.url, '_blank')
          }
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    rootFolder,
    activeSpreadsheet,
    spreadsheets,
    isInitialized,
    isLoading,
    initializeRootFolder,
    createSpreadsheet,
    setActiveSpreadsheet,
    exportData
  };
  
  return (
    <GoogleDriveContext.Provider value={value}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = (): GoogleDriveContextType => {
  const context = useContext(GoogleDriveContext);
  if (context === undefined) {
    throw new Error("useGoogleDrive must be used within a GoogleDriveProvider");
  }
  return context;
};
