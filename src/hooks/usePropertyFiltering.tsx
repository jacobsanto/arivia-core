
import { useState, useEffect } from "react";
import { UnifiedProperty } from "@/types/property.types";

interface AdvancedFilters {
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  locations: string[];
}

export const usePropertyFiltering = (properties: UnifiedProperty[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, advancedFilters]);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesAdvancedFilters = true;
    if (advancedFilters) {
      if (property.price < advancedFilters.priceRange[0] || 
          property.price > advancedFilters.priceRange[1]) {
        matchesAdvancedFilters = false;
      }
      
      if (advancedFilters.bedrooms && 
          property.bedrooms.toString() !== advancedFilters.bedrooms) {
        if (advancedFilters.bedrooms === "6+" && property.bedrooms < 6) {
          matchesAdvancedFilters = false;
        } else if (advancedFilters.bedrooms !== "6+") {
          matchesAdvancedFilters = false;
        }
      }
      
      if (advancedFilters.bathrooms && 
          property.bathrooms.toString() !== advancedFilters.bathrooms) {
        if (advancedFilters.bathrooms === "5+" && property.bathrooms < 5) {
          matchesAdvancedFilters = false;
        } else if (advancedFilters.bathrooms !== "5+") {
          matchesAdvancedFilters = false;
        }
      }
      
      if (advancedFilters.propertyType && property.type !== advancedFilters.propertyType) {
        matchesAdvancedFilters = false;
      }
    }

    return matchesSearch && matchesAdvancedFilters;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

  const handleAdvancedFilters = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
  };

  return {
    searchQuery,
    setSearchQuery,
    advancedFilters,
    handleAdvancedFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProperties,
    activeFiltersCount: advancedFilters ? Object.values(advancedFilters).filter(v => 
      Array.isArray(v) ? v.length > 0 : v).length : 0
  };
};
