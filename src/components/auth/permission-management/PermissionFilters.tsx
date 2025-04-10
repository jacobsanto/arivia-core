
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PermissionFiltersProps {
  activeCategory: string;
  permissionGroups: Record<string, string[]>;
  onCategoryChange: (category: string) => void;
}

const PermissionFilters: React.FC<PermissionFiltersProps> = ({
  activeCategory,
  permissionGroups,
  onCategoryChange
}) => {
  return (
    <TabsList className="w-full overflow-x-auto flex flex-nowrap">
      <TabsTrigger value="all" onClick={() => onCategoryChange("all")}>
        All Permissions
      </TabsTrigger>
      {Object.keys(permissionGroups).map(category => (
        <TabsTrigger 
          key={category} 
          value={category} 
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default PermissionFilters;
