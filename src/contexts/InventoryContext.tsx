
import React, { createContext, useContext, useState } from 'react';

interface InventoryContextType {
  categories: string[];
  units: string[];
  addCategory: (category: string) => void;
  addUnit: (unit: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
  children: React.ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<string[]>([
    'Housekeeping',
    'Maintenance', 
    'Kitchen',
    'Bathroom',
    'Bedroom',
    'Living Room'
  ]);

  const [units, setUnits] = useState<string[]>([
    'pieces',
    'bottles',
    'boxes',
    'rolls',
    'packs',
    'liters',
    'kilograms'
  ]);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const addUnit = (unit: string) => {
    if (!units.includes(unit)) {
      setUnits(prev => [...prev, unit]);
    }
  };

  return (
    <InventoryContext.Provider value={{ categories, units, addCategory, addUnit }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
