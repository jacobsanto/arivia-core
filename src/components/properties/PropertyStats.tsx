import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Home, 
  Wrench, 
  TrendingUp,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface Property {
  id: string;
  status: string;
  property_type: string;
}

interface PropertyStatsProps {
  properties: Property[];
}

export const PropertyStats: React.FC<PropertyStatsProps> = ({ properties }) => {
  const stats = React.useMemo(() => {
    const total = properties.length;
    const active = properties.filter(p => p.status === 'active').length;
    const maintenance = properties.filter(p => p.status === 'maintenance').length;
    const inactive = properties.filter(p => p.status === 'inactive').length;
    const villas = properties.filter(p => p.property_type === 'villa').length;
    
    return {
      total,
      active,
      maintenance,
      inactive,
      villas,
      occupancyRate: total > 0 ? Math.round((active / total) * 100) : 0
    };
  }, [properties]);

  const statCards = [
    {
      title: "Total Properties",
      value: stats.total,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Properties",
      value: stats.active,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Under Maintenance",
      value: stats.maintenance,
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Inactive",
      value: stats.inactive,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Average Occupancy",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};