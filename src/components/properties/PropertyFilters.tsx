
import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import AdvancedFilters from "./AdvancedFilters";

interface PropertyFiltersProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  onAdvancedFilters?: (filters: any) => void;
  activeFiltersCount?: number;
}

const PropertyFilters = ({ 
  searchQuery, 
  setSearchQuery,
  activeTab, 
  setActiveTab,
  onAdvancedFilters,
  activeFiltersCount = 0
}: PropertyFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="vacant">Vacant</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {onAdvancedFilters && (
        <div className="flex justify-end">
          <AdvancedFilters 
            onApplyFilters={onAdvancedFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
