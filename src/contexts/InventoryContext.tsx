
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

// Define the shape of our context data
interface InventoryContextType {
  categories: string[];
  addCategory: (category: string) => void;
  units: string[];
  addUnit: (unit: string) => void;
}

// Initial default values
const defaultInventoryContext: InventoryContextType = {
  categories: [
    "Office Supplies",
    "Paper Products",
    "Cleaning Supplies",
    "Guest Amenities",
    "Toiletries",
    "Kitchen Supplies",
    "Electronics",
    "Furniture",
    "Linens",
    "Safety Equipment"
  ],
  addCategory: () => {},
  units: ["Each", "Box", "Case", "Roll", "Pack", "Gallon", "Bottle", "Dozen"],
  addUnit: () => {},
};

// Create the context
const InventoryContext = createContext<InventoryContextType>(defaultInventoryContext);

// Custom hook for using this context
export const useInventory = () => useContext(InventoryContext);

// Provider component
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with default values
  const [categories, setCategories] = useState<string[]>(defaultInventoryContext.categories);
  const [units, setUnits] = useState<string[]>(defaultInventoryContext.units);

  // Add a new category if it doesn't already exist
  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  // Add a new unit if it doesn't already exist
  const addUnit = (unit: string) => {
    if (!units.includes(unit)) {
      setUnits(prev => [...prev, unit]);
    }
  };

  // Use localStorage to persist data with error handling
  useEffect(() => {
    try {
      // Load from localStorage on first render
      const savedCategories = localStorage.getItem('inventoryCategories');
      const savedUnits = localStorage.getItem('inventoryUnits');
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      
      if (savedUnits) {
        setUnits(JSON.parse(savedUnits));
      }
    } catch (error) {
      console.error('Failed to load inventory data from localStorage:', error);
      toast({
        title: "Storage Error",
        description: "Failed to load saved inventory settings. Using defaults.",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    try {
      // Save to localStorage whenever data changes
      localStorage.setItem('inventoryCategories', JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories to localStorage:', error);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('inventoryUnits', JSON.stringify(units));
    } catch (error) {
      console.error('Failed to save units to localStorage:', error);
    }
  }, [units]);

  return (
    <InventoryContext.Provider value={{ categories, addCategory, units, addUnit }}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;
