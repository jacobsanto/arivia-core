
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, LayoutGrid, List, Rows4, Plus } from "lucide-react";

interface Props {
  viewMode: 'kanban' | 'card' | 'list' | 'agenda';
  onViewModeChange: (mode: Props['viewMode']) => void;
}

const HousekeepingHeader: React.FC<Props> = ({ viewMode, onViewModeChange }) => {
  const getVariant = (mode: Props['viewMode']) => (viewMode === mode ? 'default' : 'outline');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Housekeeping Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and track housekeeping tasks across all properties
        </p>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <Button size="sm" variant={getVariant('kanban')} onClick={() => onViewModeChange('kanban')}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
          </Button>
          <Button size="sm" variant={getVariant('card')} onClick={() => onViewModeChange('card')}>
            <Rows4 className="h-4 w-4 mr-1" /> Card
          </Button>
          <Button size="sm" variant={getVariant('list')} onClick={() => onViewModeChange('list')}>
            <List className="h-4 w-4 mr-1" /> List
          </Button>
          <Button size="sm" variant={getVariant('agenda')} onClick={() => onViewModeChange('agenda')}>
            <CalendarClock className="h-4 w-4 mr-1" /> Agenda
          </Button>
        </div>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </Button>
      </div>
    </div>
  );
};

export default HousekeepingHeader;
