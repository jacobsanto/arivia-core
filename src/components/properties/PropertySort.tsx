
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortDesc, SortAsc } from "lucide-react";

export type SortOption = {
  label: string;
  value: string;
  column: string;
  ascending: boolean;
};

const sortOptions: SortOption[] = [
  { label: "Title (A-Z)", value: "title-asc", column: "title", ascending: true },
  { label: "Title (Z-A)", value: "title-desc", column: "title", ascending: false },
  { label: "Date synced (Newest)", value: "last_synced-desc", column: "last_synced", ascending: false },
  { label: "Date synced (Oldest)", value: "last_synced-asc", column: "last_synced", ascending: true },
];

interface PropertySortProps {
  onSortChange: (option: SortOption) => void;
  currentSort: string;
}

export const PropertySort = ({ onSortChange, currentSort }: PropertySortProps) => {
  const handleValueChange = (value: string) => {
    const option = sortOptions.find((opt) => opt.value === value);
    if (option) {
      onSortChange(option);
    }
  };

  return (
    <Select defaultValue={currentSort} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.label}
              {option.ascending ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
