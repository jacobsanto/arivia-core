import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Mail, Users, Play, Pause, Settings, Trash2 } from 'lucide-react';

export const ScheduledReports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const scheduledReports = [
    {
      id: '1',
      name: 'Daily Operations Summary',
      description: 'Daily overview of check-ins, check-outs, and tasks',
      frequency: 'Daily',
      time: '08:00',
      recipients: ['manager@arivia.com', 'operations@arivia.com'],
      status: 'active',
      lastRun: '2024-01-19 08:00',
      nextRun: '2024-01-20 08:00',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Weekly Revenue Report',
      description: 'Comprehensive weekly financial analysis',
      frequency: 'Weekly',
      time: '09:00',
      recipients: ['finance@arivia.com', 'ceo@arivia.com'],
      status: 'active',
      lastRun: '2024-01-15 09:00',
      nextRun: '2024-01-22 09:00',
      format: 'Excel'
    },
    {
      id: '3',
      name: 'Monthly Guest Satisfaction',
      description: 'Guest feedback and satisfaction metrics',
      frequency: 'Monthly',
      time: '10:00',
      recipients: ['guest-relations@arivia.com'],
      status: 'paused',
      lastRun: '2024-01-01 10:00',
      nextRun: '2024-02-01 10:00',
      format: 'PDF'
    },
    {
      id: '4',
      name: 'Maintenance Cost Analysis',
      description: 'Monthly maintenance expenses and trends',
      frequency: 'Monthly',
      time: '14:00',
      recipients: ['maintenance@arivia.com', 'finance@arivia.com'],
      status: 'active',
      lastRun: '2024-01-01 14:00',
      nextRun: '2024-02-01 14:00',
      format: 'Excel'
    }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const timeSlots = [
    { value: '06:00', label: '6:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '18:00', label: '6:00 PM' }
  ];

  const outputFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' },
    { value: 'email', label: 'Email Summary' }
  ];

  const toggleReportStatus = (reportId: string) => {
    console.log('Toggling status for report:', reportId);
  };

  const runReportNow = (reportId: string) => {
    console.log('Running report immediately:', reportId);
  };

  const editReport = (reportId: string) => {
    setSelectedReport(reportId);
  };

  const deleteReport = (reportId: string) => {
    console.log('Deleting report:', reportId);
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-foreground">{report.name}</h4>
                    <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Badge variant="outline">{report.frequency}</Badge>
                    <Badge variant="outline">{report.format}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {report.recipients.length} recipients
                    </div>
                    <div>Next run: {report.nextRun}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => runReportNow(report.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => editReport(report.id)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => toggleReportStatus(report.id)}
                  >
                    {report.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteReport(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Scheduled Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Scheduled Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input id="reportName" placeholder="Enter report name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Daily Operations</SelectItem>
                  <SelectItem value="financial">Financial Summary</SelectItem>
                  <SelectItem value="guest">Guest Analytics</SelectItem>
                  <SelectItem value="maintenance">Maintenance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map(format => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Email Recipients</Label>
            <div className="space-y-2">
              <Input placeholder="Enter email address" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  manager@arivia.com
                  <button className="ml-1 text-xs">×</button>
                </Badge>
                <Badge variant="secondary">
                  operations@arivia.com
                  <button className="ml-1 text-xs">×</button>
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="autoStart" />
              <Label htmlFor="autoStart">Start automatically</Label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Save as Draft</Button>
              <Button>Create Scheduled Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">Active Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">12</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">98%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">8</div>
            <div className="text-sm text-muted-foreground">Recipients</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};