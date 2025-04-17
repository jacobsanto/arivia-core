
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    text: string;
  };
  icon: React.ReactNode;
  color: string;
  onToggleFavorite?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color,
  onToggleFavorite
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className={`p-2 rounded-full ${color}`}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <CardDescription className="flex items-center mt-1">
            <span 
              className={cn({
                'text-emerald-600': trend.isPositive,
                'text-red-600': !trend.isPositive
              })}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
            <span className="ml-1">{trend.text}</span>
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
