
import React, { createContext, useContext, useState } from 'react';

interface InventoryContextType {
  categories: string[];
  addCategory: (category: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<string[]>([
    'Housekeeping',
    'Maintenance', 
    'Kitchen',
    'Bathroom',
    'Bedroom',
    'Living Room'
  ]);

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  return (
    <InventoryContext.Provider value={{ categories, addCategory }}>
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
