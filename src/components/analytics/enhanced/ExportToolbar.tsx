import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AnalyticsData } from '@/types/analytics.types';
import { Download, FileText, FileSpreadsheet, Image, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportToolbarProps {
  data?: AnalyticsData | null;
  loading: boolean;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({ data, loading }) => {
  const handleExport = (format: string) => {
    if (!data) {
      toast.error('No data to export');
      return;
    }

    switch (format) {
      case 'pdf':
        // Mock PDF export
        toast.success('PDF report generated successfully');
        // In real implementation: generate PDF
        break;
      case 'excel':
        // Mock Excel export
        toast.success('Excel file downloaded');
        // In real implementation: generate Excel file
        break;
      case 'csv':
        // Mock CSV export
        const csvData = generateCSV(data);
        downloadCSV(csvData, 'analytics-report.csv');
        toast.success('CSV file downloaded');
        break;
      case 'image':
        // Mock image export
        toast.success('Dashboard image exported');
        // In real implementation: capture dashboard as image
        break;
      default:
        toast.error('Export format not supported');
    }
  };

  const generateCSV = (data: AnalyticsData): string => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Operational Costs', data.kpis.totalOperationalCosts.toString()],
      ['Tasks Completed', data.kpis.tasksCompleted.toString()],
      ['Open Issues', data.kpis.openIssues.toString()],
      ['Average Cost per Task', data.kpis.avgCostPerTask.toString()],
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Analytics Report',
        text: 'Check out our latest analytics insights',
        url: window.location.href,
      }).catch(() => {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Dashboard URL copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Dashboard URL copied to clipboard');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={loading || !data}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('image')}>
            <Image className="mr-2 h-4 w-4" />
            Export as Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  );
};