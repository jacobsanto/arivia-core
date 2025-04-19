
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DamageReportHeaderProps {
  onCreateReport: () => void;
}

const DamageReportHeader: React.FC<DamageReportHeaderProps> = ({ onCreateReport }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Damage Reports</h1>
        <p className="text-muted-foreground">
          Manage and track property damage reports
        </p>
      </div>
      <Button onClick={onCreateReport} className="flex items-center gap-1">
        <Plus size={16} />
        New Report
      </Button>
    </div>
  );
};

export default DamageReportHeader;
