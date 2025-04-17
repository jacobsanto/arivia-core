
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: {
    id: string;
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    trend: 'up' | 'down' | 'neutral';
    icon?: React.ElementType;
    isFavorite?: boolean;
  };
  onToggleFavorite?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onToggleFavorite }) => {
  const {
    title,
    value,
    change,
    changeLabel,
    trend,
    icon: Icon,
    isFavorite
  } = metric;

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {onToggleFavorite && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onToggleFavorite}
          >
            <Star 
              className={cn(
                "h-4 w-4", 
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              )} 
            />
            <span className="sr-only">
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && changeLabel && (
          <CardDescription className="pt-1 flex items-center">
            {Icon && <Icon className="h-3 w-3 mr-1" />}
            <span
              className={cn({
                'text-success': trend === 'up',
                'text-destructive': trend === 'down'
              })}
            >
              {typeof change === 'number' && (change >= 0 ? '+' : '')}{change}
            </span>
            <span className="ml-1">{changeLabel}</span>
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
