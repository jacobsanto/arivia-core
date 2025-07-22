
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Play, Pause, Settings } from 'lucide-react';

export const ScheduledReports = () => {
  const scheduledReports = [
    {
      id: 1,
      name: 'Daily Operations Summary',
      frequency: 'Daily',
      nextRun: '2024-01-23 08:00',
      status: 'active',
      lastRun: '2024-01-22 08:00',
    },
    {
      id: 2,
      name: 'Weekly Performance Review',
      frequency: 'Weekly',
      nextRun: '2024-01-29 09:00',
      status: 'active',
      lastRun: '2024-01-22 09:00',
    },
    {
      id: 3,
      name: 'Monthly Financial Report',
      frequency: 'Monthly',
      nextRun: '2024-02-01 10:00',
      status: 'paused',
      lastRun: '2024-01-01 10:00',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Scheduled Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scheduledReports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{report.name}</h4>
                <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {report.frequency}
                </span>
                <span>Next: {report.nextRun}</span>
                <span>Last: {report.lastRun}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={report.status === 'active'} 
                onCheckedChange={() => {}}
              />
              <Button size="sm" variant="outline">
                <Play className="h-3 w-3 mr-1" />
                Run Now
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Create New Scheduled Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
