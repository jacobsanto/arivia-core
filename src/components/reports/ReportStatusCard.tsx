import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, BarChart3 } from "lucide-react";

interface ReportStatusCardProps {
  title: string;
  count: number;
  description: string;
  status: 'success' | 'warning' | 'pending' | 'info';
}

export const ReportStatusCard = ({ title, count, description, status }: ReportStatusCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'info':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'bg-blue-50 border-blue-200';
      case 'info':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-muted border-border';
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getStatusColor()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};