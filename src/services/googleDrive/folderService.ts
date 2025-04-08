
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DriveFolder } from "./types";

/**
 * Service for Google Drive folder operations
 */
export class FolderService {
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
}
