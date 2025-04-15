
import React from 'react';
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { Calendar, Wrench, Package, PieChart, BedDouble } from "lucide-react";

interface MobileDashboardActionsProps {
  onCreateCleaningTask: () => void;
  onCreateMaintenanceTask: () => void;
  navigate: NavigateFunction;
}

const MobileDashboardActions: React.FC<MobileDashboardActionsProps> = ({
  onCreateCleaningTask,
  onCreateMaintenanceTask,
  navigate
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Quick access buttons */}
      <ActionButton 
        icon={<Calendar className="h-4 w-4 text-blue-600" />}
        label="View Tasks"
        onClick={() => navigate('/housekeeping')}
        bgColor="bg-blue-100"
      />
      
      <ActionButton 
        icon={<Wrench className="h-4 w-4 text-amber-600" />}
        label="Maintenance"
        onClick={() => navigate('/maintenance')}
        bgColor="bg-amber-100"
      />
      
      {/* New task creation buttons */}
      <ActionButton 
        icon={<BedDouble className="h-4 w-4 text-blue-600" />}
        label="New Cleaning Task"
        onClick={onCreateCleaningTask}
        bgColor="bg-blue-100"
      />
      
      <ActionButton 
        icon={<Wrench className="h-4 w-4 text-amber-600" />}
        label="New Maintenance Task"
        onClick={onCreateMaintenanceTask}
        bgColor="bg-amber-100"
      />
      
      <ActionButton 
        icon={<Package className="h-4 w-4 text-green-600" />}
        label="Inventory"
        onClick={() => navigate('/inventory')}
        bgColor="bg-green-100"
      />
      
      <ActionButton 
        icon={<PieChart className="h-4 w-4 text-purple-600" />}
        label="Reports"
        onClick={() => navigate('/reports')}
        bgColor="bg-purple-100"
      />
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  bgColor: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onClick, bgColor }) => {
  return (
    <Button 
      variant="outline" 
      className="border-dashed border-2 h-20 flex flex-col items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </Button>
  );
};

export default MobileDashboardActions;
