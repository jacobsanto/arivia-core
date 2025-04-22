
import React from "react";

interface SyncLogFilterBarProps {
  status: string | null;
  onStatusChange: (s: string | null) => void;
  integration: string | null;
  onIntegrationChange: (s: string | null) => void;
  availableIntegrations: string[];
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
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-2">
      {/* Status Chips */}
      <div className="flex flex-row gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value ?? "all"}
            onClick={() => onStatusChange(opt.value)}
            className={`rounded-full px-3 py-1 text-sm border transition
              ${status === opt.value ? "bg-primary text-primary-foreground border-primary shadow" : "bg-muted border-input"}
            `}
            style={{ minHeight: 32 }}
            aria-pressed={status === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Integration filter */}
      {availableIntegrations.length > 1 && (
        <select
          className="ml-1 rounded border px-3 py-1 text-sm bg-background text-foreground"
          value={integration ?? ""}
          onChange={e =>
            onIntegrationChange(e.target.value === "" ? null : e.target.value)
          }
        >
          <option value="">All Integrations</option>
          {availableIntegrations.map((name) => (
            <option value={name} key={name}>{name}</option>
          ))}
        </select>
      )}
    </div>
  );
};
