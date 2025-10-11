
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { inventoryService, InventoryCategory } from '@/services/inventory.service';
import { logger } from '@/services/logger';

// Define the shape of our context data
interface InventoryContextType {
  categories: string[];
  categoryObjects: InventoryCategory[];
  addCategory: (category: string) => void;
  units: string[];
  addUnit: (unit: string) => void;
  loading: boolean;
}

// Initial default values
const defaultInventoryContext: InventoryContextType = {
  categories: [],
  categoryObjects: [],
  addCategory: () => {},
  units: ["Each", "Box", "Case", "Roll", "Pack", "Gallon", "Bottle", "Dozen"],
  addUnit: () => {},
  loading: true,
};

// Create the context
const InventoryContext = createContext<InventoryContextType>(defaultInventoryContext);

// Custom hook for using this context
export const useInventory = () => useContext(InventoryContext);

// Provider component
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryObjects, setCategoryObjects] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<string[]>(defaultInventoryContext.units);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getCategories();
        setCategoryObjects(data);
        setCategories(data.map(cat => cat.name));
      } catch (error) {
        logger.error('Error loading categories', error);
        toast({
          title: "Error",
          description: "Failed to load inventory categories",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  // Add a new category if it doesn't already exist
  const addCategory = async (category: string) => {
    if (!categories.includes(category)) {
      try {
        const newCategory = await inventoryService.createCategory(category);
        if (newCategory) {
          const newCategories = [...categories, category];
          const newCategoryObjects = [...categoryObjects, newCategory];
          setCategories(newCategories);
          setCategoryObjects(newCategoryObjects);
        }
      } catch (error) {
        logger.error('Error creating category', error);
        toast({
          title: "Error",
          description: "Failed to create category",
          variant: "destructive",
        });
      }
    }
  };

  // Add a new unit if it doesn't already exist
  const addUnit = (unit: string) => {
    if (!units.includes(unit)) {
      setUnits(prev => [...prev, unit]);
    }
  };

  // Use localStorage to persist units only (categories are now in database)
  useEffect(() => {
    try {
      const savedUnits = localStorage.getItem('inventoryUnits');
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    } catch (error) {
      logger.error('Failed to load units from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('inventoryUnits', JSON.stringify(units));
    } catch (error) {
      logger.error('Failed to save units to localStorage', error);
    }
  }, [units]);

  return (
    <InventoryContext.Provider value={{ categories, categoryObjects, addCategory, units, addUnit, loading }}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;
