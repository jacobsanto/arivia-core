
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChecklistPageHeaderProps {
  onCreateTemplate: () => void;
}

const ChecklistPageHeader = ({ onCreateTemplate }: ChecklistPageHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl">
            <CheckSquare className="mr-2 h-7 w-7" /> Checklist Templates
          </h1>
          <p className="text-sm text-muted-foreground tracking-tight">
            Manage checklist templates for tasks and operations
          </p>
        </div>
      </div>
      <Button onClick={onCreateTemplate}>
        <Plus className="h-4 w-4 mr-2" /> New Template
      </Button>
    </div>
  );
};

export default ChecklistPageHeader;
