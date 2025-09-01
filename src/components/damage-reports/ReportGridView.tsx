import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportCard } from './ReportCard';
import { DamageReport } from '@/types/damage-reports.types';

interface ReportGridViewProps {
  reports: DamageReport[];
  onReportClick: (report: DamageReport) => void;
  loading?: boolean;
}

export const ReportGridView: React.FC<ReportGridViewProps> = ({
  reports,
  onReportClick,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onClick={onReportClick}
        />
      ))}
    </div>
  );
};