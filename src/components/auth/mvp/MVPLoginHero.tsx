import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Users, BarChart3, CheckCircle, Wrench } from "lucide-react";

export const MVPLoginHero: React.FC = () => {
  const features = [
    {
      icon: Building,
      title: "Property Management",
      description: "Manage all your properties from one centralized platform"
    },
    {
      icon: Calendar,
      title: "Booking Integration",
      description: "Seamless integration with PMS (Tokeet, Advance CM) and Google Workspace"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Coordinate housekeeping, maintenance, and management teams"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track performance and generate detailed operational reports"
    },
    {
      icon: CheckCircle,
      title: "Task Management",
      description: "Automated task creation and assignment based on bookings"
    },
    {
      icon: Wrench,
      title: "Maintenance Tracking",
      description: "Schedule and track maintenance requests and repairs"
    }
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-primary/5 to-primary/10 p-10 flex flex-col justify-center">
      <div className="max-w-lg">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            Professional Platform
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Streamline Your Property Operations
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage your villa rentals efficiently. 
            From bookings to maintenance, all in one powerful platform.
          </p>
        </div>

        <div className="grid gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-sm bg-background/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-lg bg-background/50 backdrop-blur-sm border">
          <p className="text-sm text-muted-foreground text-center">
            Trusted by property managers across Greece
          </p>
        </div>
      </div>
    </div>
  );
};