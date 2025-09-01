import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DamageAgendaGroup, DamageReport } from '@/types/damage-reports.types';
import { ReportCard } from './ReportCard';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface ReportAgendaViewProps {
  groups: DamageAgendaGroup[];
  onReportClick: (report: DamageReport) => void;
  loading?: boolean;
}

export const ReportAgendaView: React.FC<ReportAgendaViewProps> = ({
  groups,
  onReportClick,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-32 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardHeader>
          <CardTitle>No damage reports found</CardTitle>
          <CardDescription>
            Try adjusting your filters or create a new damage report.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getGroupIcon = (key: string) => {
    switch (key) {
      case 'today': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'yesterday': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'week': return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'older': return <CheckCircle className="h-5 w-5 text-muted-foreground" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getGroupColor = (key: string) => {
    switch (key) {
      case 'today': return 'border-orange-200';
      case 'yesterday': return 'border-blue-200';
      default: return 'border-border';
    }
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group.key} className={getGroupColor(group.key)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getGroupIcon(group.key)}
              {group.title}
              <Badge variant="outline" className="ml-auto">
                {group.count} report{group.count !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
            {group.isToday && (
              <CardDescription>
                Reports requiring immediate attention
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {group.reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onClick={onReportClick}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No reports in this category
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};