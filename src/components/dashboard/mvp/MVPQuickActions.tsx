
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, FileText, Settings, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MVPQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add Property",
      icon: Plus,
      action: () => navigate("/properties"),
      color: "text-blue-600"
    },
    {
      title: "View Calendar",
      icon: Calendar,
      action: () => navigate("/properties"),
      color: "text-green-600"
    },
    {
      title: "Manage Team",
      icon: Users,
      action: () => navigate("/admin/users"),
      color: "text-purple-600"
    },
    {
      title: "View Reports",
      icon: FileText,
      action: () => navigate("/reports"),
      color: "text-orange-600"
    },
    {
      title: "Maintenance",
      icon: Wrench,
      action: () => navigate("/maintenance"),
      color: "text-red-600"
    },
    {
      title: "Settings",
      icon: Settings,
      action: () => navigate("/admin/settings"),
      color: "text-gray-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={action.action}
            >
              <Icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <span>{action.title}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
