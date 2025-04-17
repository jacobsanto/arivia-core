
import { StarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

export const createMetricCards = (data: any, favoriteMetrics: string[] = []) => {
  if (!data) return [];
  
  return [
    {
      id: 'occupancy-rate',
      title: 'Occupancy Rate',
      value: `${data.occupancy_rate || 0}%`,
      change: data.occupancy_change || 0,
      changeLabel: 'vs. last period',
      trend: (data.occupancy_change || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUpIcon,
      isFavorite: favoriteMetrics.includes('occupancy-rate')
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: `€${data.revenue?.toLocaleString() || 0}`,
      change: data.revenue_change || 0,
      changeLabel: 'vs. last period',
      trend: (data.revenue_change || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUpIcon,
      isFavorite: favoriteMetrics.includes('revenue')
    },
    {
      id: 'tasks-completed',
      title: 'Tasks Completed',
      value: data.tasks?.completed || 0,
      change: data.tasks_completion_rate || 0,
      changeLabel: 'completion rate',
      trend: (data.tasks_completion_rate || 0) >= 75 ? 'up' : 'down',
      icon: StarIcon,
      isFavorite: favoriteMetrics.includes('tasks-completed')
    },
    {
      id: 'maintenance-issues',
      title: 'Maintenance Issues',
      value: data.maintenance?.total || 0,
      change: data.maintenance?.critical || 0,
      changeLabel: 'critical issues',
      trend: (data.maintenance?.critical || 0) > 0 ? 'down' : 'up',
      icon: TrendingDownIcon,
      isFavorite: favoriteMetrics.includes('maintenance-issues')
    },
    {
      id: 'available-properties',
      title: 'Available Properties',
      value: data.properties?.vacant || 0,
      change: data.properties?.total || 0,
      changeLabel: 'total properties',
      trend: 'neutral',
      icon: StarIcon,
      isFavorite: favoriteMetrics.includes('available-properties')
    },
    {
      id: 'upcoming-checkins',
      title: 'Upcoming Check-ins',
      value: data.check_ins || 0,
      change: data.check_ins_change || 0,
      changeLabel: 'vs. last week',
      trend: (data.check_ins_change || 0) >= 0 ? 'up' : 'down',
      icon: TrendingUpIcon,
      isFavorite: favoriteMetrics.includes('upcoming-checkins')
    }
  ];
};
