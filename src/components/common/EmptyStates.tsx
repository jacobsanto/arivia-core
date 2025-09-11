import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Database, 
  Users, 
  Calendar, 
  ClipboardList,
  Package,
  MessageSquare,
  Settings,
  AlertCircle
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Database,
  title,
  description,
  action,
  className = ''
}) => (
  <Card className={`text-center ${className}`}>
    <CardContent className="py-12">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <CardTitle className="mb-2">{title}</CardTitle>
      <CardDescription className="mb-6 max-w-md mx-auto">
        {description}
      </CardDescription>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="min-w-32"
        >
          <Plus className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Predefined empty states for common scenarios
export const EmptyTasks: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => (
  <EmptyState
    icon={ClipboardList}
    title="No tasks yet"
    description="Create your first task to get started with managing your property operations."
    action={onCreateTask ? {
      label: 'Create Task',
      onClick: onCreateTask
    } : undefined}
  />
);

export const EmptyUsers: React.FC<{ onAddUser?: () => void }> = ({ onAddUser }) => (
  <EmptyState
    icon={Users}
    title="No users found"
    description="Add team members to start collaborating on property management tasks."
    action={onAddUser ? {
      label: 'Add User',
      onClick: onAddUser
    } : undefined}
  />
);

export const EmptyProperties: React.FC<{ onAddProperty?: () => void }> = ({ onAddProperty }) => (
  <EmptyState
    icon={Database}
    title="No properties yet"
    description="Add your first property to start managing bookings, maintenance, and operations."
    action={onAddProperty ? {
      label: 'Add Property',
      onClick: onAddProperty
    } : undefined}
  />
);

export const EmptyInventory: React.FC<{ onAddItem?: () => void }> = ({ onAddItem }) => (
  <EmptyState
    icon={Package}
    title="No inventory items"
    description="Start tracking your property supplies and equipment by adding your first inventory item."
    action={onAddItem ? {
      label: 'Add Item',
      onClick: onAddItem
    } : undefined}
  />
);

export const EmptyBookings: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon={Calendar}
    title="No bookings found"
    description="Your bookings will appear here once they sync from your property management system."
    action={onRefresh ? {
      label: 'Refresh Data',
      onClick: onRefresh,
      variant: 'outline' as const
    } : undefined}
  />
);

export const EmptyMessages: React.FC<{ onStartChat?: () => void }> = ({ onStartChat }) => (
  <EmptyState
    icon={MessageSquare}
    title="No messages yet"
    description="Start a conversation with your team to coordinate property operations and tasks."
    action={onStartChat ? {
      label: 'Start Chat',
      onClick: onStartChat
    } : undefined}
  />
);

export const EmptySearchResults: React.FC<{ query?: string; onClearSearch?: () => void }> = ({ 
  query, 
  onClearSearch 
}) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={query ? `No items match "${query}". Try adjusting your search terms.` : 'No items match your search criteria.'}
    action={onClearSearch ? {
      label: 'Clear Search',
      onClick: onClearSearch,
      variant: 'outline' as const
    } : undefined}
  />
);

export const ErrorState: React.FC<{ 
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({ 
  title = 'Something went wrong',
  description = 'We encountered an error while loading this data. Please try again.',
  onRetry
}) => (
  <EmptyState
    icon={AlertCircle}
    title={title}
    description={description}
    action={onRetry ? {
      label: 'Try Again',
      onClick: onRetry,
      variant: 'outline' as const
    } : undefined}
  />
);

export const PermissionDenied: React.FC<{ 
  action?: string;
  onContactAdmin?: () => void;
}> = ({ 
  action = 'access this content',
  onContactAdmin 
}) => (
  <EmptyState
    icon={Settings}
    title="Access denied"
    description={`You don't have permission to ${action}. Contact your administrator if you need access.`}
    action={onContactAdmin ? {
      label: 'Contact Admin',
      onClick: onContactAdmin,
      variant: 'outline' as const
    } : undefined}
  />
);