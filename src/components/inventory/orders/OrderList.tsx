
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface OrderListProps {
  orders: any[];
  isLoading?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ orders, isLoading }) => {
  const { canAccess } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{order.id.slice(-8)}
              </CardTitle>
              <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1">
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
            </div>
            <CardDescription>
              Created: {new Date(order.created_at).toLocaleDateString()}
              {order.vendor && ` • Vendor: ${order.vendor.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Items:</span>
                <span className="font-medium">{order.items?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Price:</span>
                <span className="font-medium">€{order.total_price || '0.00'}</span>
              </div>
              {canAccess('approveTransfers') && order.status === 'pending' && (
                <div className="mt-3 text-sm text-amber-600">
                  Awaiting approval
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">Orders will appear here once created.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderList;
