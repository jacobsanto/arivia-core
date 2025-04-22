
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SyncLogFilterBarProps {
  status: string | null;
  onStatusChange: (s: string | null) => void;
  integration: string | null;
  onIntegrationChange: (s: string | null) => void;
  availableIntegrations: string[];
  listingId: string;
  onListingIdChange: (id: string) => void;
}

const statusOptions = [
  { value: null, label: "All" },
  { value: "completed", label: "✅ Success" },
  { value: "error", label: "❌ Error" },
];

export const SyncLogFilterBar: React.FC<SyncLogFilterBarProps> = ({
  status,
  onStatusChange,
  integration,
  onIntegrationChange,
  availableIntegrations,
  listingId,
  onListingIdChange,
}) => {
  return (
    <div className="space-y-4 pb-4 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-4">
      {/* Status Chips */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Status</Label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value ?? "all"}
              onClick={() => onStatusChange(opt.value)}
              className={`rounded-full px-3 py-1 text-sm border transition whitespace-nowrap
                ${status === opt.value ? "bg-primary text-primary-foreground border-primary shadow" : "bg-muted border-input"}
              `}
              style={{ minHeight: 32 }}
              aria-pressed={status === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Integration filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Integration</Label>
        <Select 
          value={integration ?? ""} 
          onValueChange={val => onIntegrationChange(val === "" ? null : val)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Integrations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Integrations</SelectItem>
            {availableIntegrations.map((name) => (
              <SelectItem value={name} key={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Listing ID filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Listing ID (Optional)</Label>
        <Input
          placeholder="Filter by listing ID"
          value={listingId}
          onChange={(e) => onListingIdChange(e.target.value)}
          className="w-full md:w-[200px]"
        />
      </div>
    </div>
  );
};
