
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CleaningDefinition } from "@/types/housekeepingTypes";

export const useCleaningDefinitions = () => {
  const [cleaningDefinitions, setCleaningDefinitions] = useState<Record<string, string>>({});

  const fetchCleaningDefinitions = async () => {
    try {
      const { data, error } = await supabase
        .from('cleaning_service_definitions')
        .select('task_type, description');
        
      if (error) throw error;
      
      const definitions: Record<string, string> = {};
      
      if (data && Array.isArray(data)) {
        data.forEach((item: CleaningDefinition) => {
          definitions[item.task_type] = item.description;
        });
      }
      
      setCleaningDefinitions(definitions);
    } catch (error) {
      console.error('Error fetching cleaning definitions:', error);
    }
  };

  useEffect(() => {
    fetchCleaningDefinitions();
  }, []);

  return { cleaningDefinitions };
};
