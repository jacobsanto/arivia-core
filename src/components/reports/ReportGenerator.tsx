import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText } from 'lucide-react';
import { ReportType } from '@/types/reports.types';
import { useReportsGenerator } from '@/hooks/useReportsGenerator';

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'task-completion-log',
    label: 'Task Completion Log',
    description: 'Comprehensive record of all housekeeping and maintenance tasks'
  },
  {
    value: 'maintenance-cost-breakdown',
    label: 'Maintenance Cost Breakdown',
    description: 'Financial analysis of repair expenses and maintenance costs'
  },
  {
    value: 'damage-history',
    label: 'Damage History',
    description: 'Log of all reported damages, sources, and repair costs'
  },
  {
    value: 'inventory-levels',
    label: 'Inventory Levels',
    description: 'Current stock quantities and values snapshot'
  }
];

const PROPERTIES = ['Villa Caldera', 'Villa Azure', 'Villa Sunset'];
const ASSIGNEES = ['Maria Kostas', 'Nikos Stavros', 'Elena Dimitriou', 'Dimitris Papadakis', 'Yannis Korres'];
const STATUSES = ['Completed', 'In Progress', 'Pending', 'Cancelled'];
const SOURCES = ['Guest', 'Staff', 'Unknown', 'Natural Wear'];
const CATEGORIES = ['Linens', 'Toiletries', 'Maintenance', 'Plumbing', 'Pool Maintenance', 'Electrical'];

export const ReportGenerator: React.FC = () => {
  const {
    reportType,
    startDate,
    endDate,
    filters,
    isGenerating,
    updateReportType,
    updateDateRange,
    updateFilters,
    generateReport
  } = useReportsGenerator();

  const handleStartDateChange = (value: string) => {
    updateDateRange(value, endDate);
  };

  const handleEndDateChange = (value: string) => {
    updateDateRange(startDate, value);
  };

  const isDateRangeRequired = reportType !== 'inventory-levels';
  const canGenerate = reportType && (!isDateRangeRequired || (startDate && endDate));

  const renderFilters = () => {
    if (!reportType) return null;

    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium">Contextual Filters</Label>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Property Filter - Available for all report types */}
          <div className="space-y-2">
            <Label htmlFor="property-filter">Property</Label>
            <Select
              value={filters.property || ''}
              onValueChange={(value) => updateFilters({ property: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Properties</SelectItem>
                {PROPERTIES.map(property => (
                  <SelectItem key={property} value={property}>{property}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Task-specific filters */}
          {reportType === 'task-completion-log' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignee-filter">Assignee</Label>
                <Select
                  value={filters.assignee || ''}
                  onValueChange={(value) => updateFilters({ assignee: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Assignees</SelectItem>
                    {ASSIGNEES.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => updateFilters({ status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Maintenance-specific filters */}
          {reportType === 'maintenance-cost-breakdown' && (
            <div className="space-y-2">
              <Label htmlFor="category-filter">Task Type</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilters({ category: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Task Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Task Types</SelectItem>
                  {CATEGORIES.slice(2).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Damage-specific filters */}
          {reportType === 'damage-history' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="source-filter">Source</Label>
                <Select
                  value={filters.source || ''}
                  onValueChange={(value) => updateFilters({ source: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sources</SelectItem>
                    {SOURCES.map(source => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="damage-status-filter">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => updateFilters({ status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Inventory-specific filters */}
          {reportType === 'inventory-levels' && (
            <div className="space-y-2">
              <Label htmlFor="inventory-category-filter">Category</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilters({ category: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {CATEGORIES.slice(0, 3).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Select Report Type */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Step 1: Select Report Type</Label>
          <Select
            value={reportType}
            onValueChange={(value) => updateReportType(value as ReportType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose the type of report to generate" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Define Time Window */}
        {reportType && isDateRangeRequired && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Step 2: Define Time Window</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Apply Contextual Filters */}
        {reportType && renderFilters()}

        {/* Step 4: Generate Report */}
        {reportType && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Step {isDateRangeRequired ? '4' : '3'}: Generate Report
            </Label>
            <Button
              onClick={generateReport}
              disabled={!canGenerate || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};