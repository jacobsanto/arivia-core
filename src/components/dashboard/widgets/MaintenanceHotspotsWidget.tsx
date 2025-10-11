import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

interface MaintenanceHotspot {
  id: string;
  property: string;
  openIssues: number;
  lastIssue: string;
  commonIssue: string;
}

export const MaintenanceHotspotsWidget: React.FC = () => {
  const [hotspots, setHotspots] = useState<MaintenanceHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceHotspots();
  }, []);

  const fetchMaintenanceHotspots = async () => {
    try {
      // Get maintenance tasks grouped by property
      const { data: maintenanceTasks } = await supabase
        .from('maintenance_tasks')
        .select(`
          id,
          property_id,
          task_type,
          status,
          updated_at,
          properties (name)
        `)
        .eq('status', 'pending');

      // Get properties data
      const { data: properties } = await supabase
        .from('properties')
        .select('id, name');

      if (!maintenanceTasks || !properties) {
        setHotspots([]);
        return;
      }

      // Group tasks by property and calculate stats
      const propertyStats = new Map<string, {
        name: string;
        openIssues: number;
        lastIssue: string;
        taskTypes: string[];
      }>();

      maintenanceTasks.forEach(task => {
        const propertyId = task.property_id;
        const propertyName = task.properties?.name || 'Unknown Property';
        
        if (!propertyStats.has(propertyId)) {
          propertyStats.set(propertyId, {
            name: propertyName,
            openIssues: 0,
            lastIssue: task.updated_at,
            taskTypes: []
          });
        }

        const stats = propertyStats.get(propertyId)!;
        stats.openIssues++;
        stats.taskTypes.push(task.task_type);
        
        // Keep the most recent issue date
        if (new Date(task.updated_at) > new Date(stats.lastIssue)) {
          stats.lastIssue = task.updated_at;
        }
      });

      // Convert to hotspots array and sort by issue count
      const hotspotsArray: MaintenanceHotspot[] = Array.from(propertyStats.entries())
        .map(([propertyId, stats]) => {
          // Find most common task type
          const taskTypeCounts = stats.taskTypes.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const mostCommonType = Object.entries(taskTypeCounts)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'General';

          return {
            id: propertyId,
            property: stats.name,
            openIssues: stats.openIssues,
            lastIssue: formatTimeAgo(stats.lastIssue),
            commonIssue: mostCommonType
          };
        })
        .sort((a, b) => b.openIssues - a.openIssues)
        .slice(0, 5);

      setHotspots(hotspotsArray);
    } catch (error) {
      logger.error('Error fetching maintenance hotspots', error);
      setHotspots([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Maintenance Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Maintenance Hotspots
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hotspots.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No maintenance issues currently
          </div>
        ) : (
          <div className="space-y-3">
            {hotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-sm">{hotspot.property}</h4>
                    <p className="text-xs text-muted-foreground">
                      Common: {hotspot.commonIssue} • Last: {hotspot.lastIssue}
                    </p>
                  </div>
                </div>
                
                <Badge variant={hotspot.openIssues > 3 ? "destructive" : "secondary"}>
                  {hotspot.openIssues} issue{hotspot.openIssues !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};