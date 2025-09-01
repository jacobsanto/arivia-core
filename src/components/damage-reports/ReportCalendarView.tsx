import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DamageReport } from '@/types/damage-reports.types';
import { format, isSameDay } from 'date-fns';
import { AlertTriangle, DollarSign, MapPin } from 'lucide-react';

interface ReportCalendarViewProps {
  reports: DamageReport[];
  onReportClick: (report: DamageReport) => void;
}

export const ReportCalendarView: React.FC<ReportCalendarViewProps> = ({
  reports,
  onReportClick
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getReportsForDate = (date: Date) => {
    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return isSameDay(reportDate, date);
    });
  };

  const getSelectedDateReports = () => {
    if (!selectedDate) return [];
    return getReportsForDate(selectedDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Create modifiers for calendar days with reports
  const modifiers = {
    hasReports: (date: Date) => getReportsForDate(date).length > 0,
    hasUrgent: (date: Date) => getReportsForDate(date).some(r => r.priority === 'urgent')
  };

  const modifiersStyles = {
    hasReports: {
      backgroundColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      borderRadius: '4px',
    },
    hasUrgent: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
      borderRadius: '4px',
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Damage Reports Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>Has reports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-destructive" />
                <span>Has urgent reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Reports */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? format(selectedDate, 'MMMM d, yyyy')
                : 'Select a date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSelectedDateReports().length > 0 ? (
                getSelectedDateReports().map((report) => {
                  const cost = report.actualCost || report.estimatedCost;
                  
                  return (
                    <div
                      key={report.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => onReportClick(report)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{report.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{report.property.name} • {report.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>€{cost.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(report.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      
                      {report.priority === 'urgent' && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="font-medium">Urgent attention required</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No damage reports for this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportCalendarView;