import React from 'react';
import { LazyImage } from './LazyImage';
import { VirtualizedList } from './VirtualizedList';
import { useOptimizedProfiles } from '@/hooks/useOptimizedQueries';
import { CDNManager } from '@/utils/cdnOptimization';

// Apply optimizations to existing components
export const OptimizedPropertyCard: React.FC<{
  property: any;
  onSelect?: (id: string) => void;
}> = React.memo(({ property, onSelect }) => {
  const cdnManager = CDNManager.getInstance();

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <LazyImage
        src={property.image_url}
        alt={property.name}
        className="aspect-video w-full rounded-t-lg object-cover"
        fallback="/placeholder.svg"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold">{property.name}</h3>
        <p className="text-muted-foreground">{property.address}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-bold">€{property.price_per_night}/night</span>
          <button
            onClick={() => onSelect?.(property.id)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});

export const OptimizedUserList: React.FC<{
  role?: string;
  onUserSelect?: (user: any) => void;
}> = React.memo(({ role, onUserSelect }) => {
  const { data: users, isLoading } = useOptimizedProfiles({ role, limit: 50 });

  if (isLoading) {
    return <div>Loading optimized user list...</div>;
  }

  const renderUser = (user: any, index: number, style: React.CSSProperties) => (
    <div
      key={user.id}
      style={style}
      className="flex items-center space-x-4 p-4 hover:bg-muted/50 cursor-pointer"
      onClick={() => onUserSelect?.(user)}
    >
      <LazyImage
        src={user.avatar || '/placeholder.svg'}
        alt={user.name}
        className="h-10 w-10 rounded-full"
        fallback="/placeholder.svg"
      />
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
      </div>
    </div>
  );

  return (
    <VirtualizedList
      items={users || []}
      renderItem={renderUser}
      itemHeight={80}
      height={400}
    />
  );
});

export const OptimizedDashboard: React.FC = React.memo(() => {
  // Preload critical assets
  React.useEffect(() => {
    const cdnManager = CDNManager.getInstance();
    cdnManager.preloadAssets([
      '/images/dashboard-bg.jpg',
      '/images/logo.png'
    ]);
    cdnManager.loadCriticalCSS('dashboard.css');
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Optimized Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard content will use optimized components */}
      </div>
    </div>
  );
});

OptimizedPropertyCard.displayName = 'OptimizedPropertyCard';
OptimizedUserList.displayName = 'OptimizedUserList';
OptimizedDashboard.displayName = 'OptimizedDashboard';