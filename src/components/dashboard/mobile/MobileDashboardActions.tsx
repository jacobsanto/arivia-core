
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigateFunction } from 'react-router-dom';
import { 
  Brush, 
  Hammer, 
  ShoppingCart, 
  FileSpreadsheet, 
  CalendarDays,
  Users
} from "lucide-react";

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
  const actionItems = [
    {
      icon: <Brush className="h-5 w-5" />,
      label: "New Cleaning Task",
      onClick: onCreateCleaningTask,
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: <Hammer className="h-5 w-5" />,
      label: "New Maintenance",
      onClick: onCreateMaintenanceTask,
      color: "bg-emerald-100 text-emerald-800" 
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      label: "Inventory",
      onClick: () => navigate('/inventory'),
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      label: "My Reports",
      onClick: () => navigate('/reports'),
      color: "bg-amber-100 text-amber-800"
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      label: "Calendar View",
      onClick: () => navigate('/calendar'),
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Team Members",
      onClick: () => navigate('/team'),
      color: "bg-rose-100 text-rose-800"
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actionItems.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto py-6 flex flex-col items-center justify-center gap-3 ${item.color} border-none`}
              onClick={item.onClick}
            >
              <div className="bg-white p-3 rounded-full shadow-sm">
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileDashboardActions;
