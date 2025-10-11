import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileWarning, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

interface DamageReport {
  id: string;
  title: string;
  property: string;
  reportedBy: string;
  timestamp: string;
  severity: string;
  status: string;
}

export const RecentDamageReportsWidget: React.FC = () => {
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentDamageReports();
  }, []);

  const fetchRecentDamageReports = async () => {
    try {
      // Get recent damage reports
      const { data: reports } = await supabase
        .from('damage_reports')
        .select(`
          id,
          title,
          description,
          property_id,
          reported_by,
          severity,
          status,
          created_at,
          properties (name),
          profiles!reported_by (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!reports) {
        setDamageReports([]);
        return;
      }

      // Get property names and reporter names separately to avoid relation issues
      const propertyIds = reports.map(r => r.property_id).filter(Boolean);
      const reporterIds = reports.map(r => r.reported_by).filter(Boolean);

      const [propertiesData, profilesData] = await Promise.all([
        propertyIds.length > 0 ? supabase
          .from('properties')
          .select('id, name')
          .in('id', propertyIds) : { data: [] },
        reporterIds.length > 0 ? supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', reporterIds) : { data: [] }
      ]);

      const propertyMap = new Map<string, string>();
      propertiesData.data?.forEach(p => propertyMap.set(p.id, p.name));

      const profileMap = new Map<string, string>();
      profilesData.data?.forEach(p => profileMap.set(p.user_id, p.name));

      const formattedReports: DamageReport[] = reports.map(report => ({
        id: report.id,
        title: report.title || report.description || 'Damage Report',
        property: propertyMap.get(report.property_id) || 'Unknown Property',
        reportedBy: profileMap.get(report.reported_by) || 'Unknown User',
        timestamp: report.created_at,
        severity: report.severity || 'medium',
        status: report.status
      }));

      setDamageReports(formattedReports);
    } catch (error) {
      logger.error('Error fetching damage reports', error);
      setDamageReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 text-red-700';
      case 'medium': return 'border-yellow-500 text-yellow-700';
      case 'low': return 'border-green-500 text-green-700';
      default: return 'border-gray-500 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_review': return 'bg-blue-500';
      case 'assigned': return 'bg-orange-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-red-500" />
            Recent Damage Reports
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
          <FileWarning className="h-5 w-5 text-red-500" />
          Recent Damage Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        {damageReports.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No recent damage reports
          </div>
        ) : (
          <div className="space-y-3">
            {damageReports.map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <AlertTriangle className="h-4 w-4 mt-1 text-muted-foreground" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{report.title}</h4>
                    <Badge variant="outline" className={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {report.property} • Reported by {report.reportedBy}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                  </p>
                </div>
                
                <div className={`w-2 h-2 rounded-full ${getStatusColor(report.status)}`} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};