
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Filter, 
  Plus, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import { DamageReport, DamageReportStatus } from '@/types/damage';

const DamageReports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  // Mock data for demonstration
  const mockReports: DamageReport[] = [
    {
      id: '1',
      title: 'Broken bathroom mirror',
      description: 'Guest accidentally broke the bathroom mirror in Villa Santorini',
      damage_date: '2024-01-15T10:30:00Z',
      estimated_cost: 150,
      property_id: 'prop-1',
      assigned_to: 'user-1',
      status: 'pending' as DamageReportStatus,
      priority: 'medium',
      reported_by: 'user-2',
      created_at: '2024-01-15T10:35:00Z',
      updated_at: '2024-01-15T10:35:00Z'
    },
    {
      id: '2',
      title: 'Stained carpet in living room',
      description: 'Red wine stain on the white carpet that requires professional cleaning',
      damage_date: '2024-01-14T20:15:00Z',
      estimated_cost: 200,
      property_id: 'prop-2',
      assigned_to: 'user-3',
      status: 'investigating' as DamageReportStatus,
      priority: 'low',
      reported_by: 'user-4',
      created_at: '2024-01-14T20:20:00Z',
      updated_at: '2024-01-15T09:00:00Z'
    },
    {
      id: '3',
      title: 'Damaged outdoor furniture',
      description: 'Patio chair leg broken during guest stay',
      damage_date: '2024-01-13T16:45:00Z',
      estimated_cost: 300,
      property_id: 'prop-3',
      assigned_to: 'user-5',
      status: 'resolved' as DamageReportStatus,
      priority: 'high',
      reported_by: 'user-6',
      created_at: '2024-01-13T17:00:00Z',
      updated_at: '2024-01-14T14:30:00Z'
    }
  ];

  const [reports] = useState<DamageReport[]>(mockReports);

  const getStatusColor = (status: DamageReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'compensation_required':
        return 'bg-orange-100 text-orange-800';
      case 'compensation_paid':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DamageReportStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'investigating':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReport = () => {
    const newReport: DamageReport = {
      id: Date.now().toString(),
      title: 'New Damage Report',
      description: 'Description of the damage',
      damage_date: new Date().toISOString(),
      estimated_cost: 0,
      property_id: 'prop-1',
      assigned_to: undefined,
      status: 'pending' as DamageReportStatus,
      priority: 'medium',
      reported_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // In a real app, this would save to the database
    console.log('Creating new report:', newReport);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Damage Reports</h1>
          <p className="text-muted-foreground">
            Track and manage property damage incidents
          </p>
        </div>
        <Button onClick={handleCreateReport} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="compensation_required">Compensation Required</SelectItem>
                <SelectItem value="compensation_paid">Compensation Paid</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md cursor-pointer transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-1">{report.title}</CardTitle>
                <Badge className={`${getStatusColor(report.status)} flex items-center gap-1`}>
                  {getStatusIcon(report.status)}
                  {report.status}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(report.damage_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Estimated: ${report.estimated_cost}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  Assigned: {report.assigned_to || 'Unassigned'}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No damage reports found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'Get started by creating your first damage report'
            }
          </p>
          {(!searchQuery && statusFilter === 'all') && (
            <Button onClick={handleCreateReport} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create First Report
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DamageReports;
