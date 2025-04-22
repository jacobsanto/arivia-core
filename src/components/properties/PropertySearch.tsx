
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PropertySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const PropertySearch = ({ 
  searchQuery, 
  setSearchQuery 
}: PropertySearchProps) => {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search properties..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
