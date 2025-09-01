import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Building, 
  User, 
  Clock, 
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro
} from "lucide-react";
import { format } from "date-fns";

interface ManagePurchaseOrderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export const ManagePurchaseOrderModal: React.FC<ManagePurchaseOrderModalProps> = ({
  isOpen,
  onOpenChange,
  order
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'ordered': return <ShoppingCart className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ordered': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'received': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'ordered': return 'Ordered';
      case 'received': return 'Received';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (!order) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Create Purchase Order
            </DialogTitle>
            <DialogDescription>
              Create a new purchase order for inventory procurement
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            <p>Purchase order creation form coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchase Order - {order.po_number}
          </DialogTitle>
          <DialogDescription>
            View and manage purchase order details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.vendor_name}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.created_by}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(order.created_at), 'PPP p')}</span>
                  </div>
                </div>
              </div>

              {order.approved_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.approved_by}</span>
                  </div>
                </div>
              )}

              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          Quantity: {item.quantity_ordered} units
                          {item.quantity_received && (
                            <span className="ml-2">
                              • Received: {item.quantity_received} units
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Unit Price</div>
                        <div className="font-medium">€{item.unit_cost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Total: €{item.total_cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>€{order.subtotal.toFixed(2)}</span>
                </div>
                {order.tax_amount && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>€{order.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span className="flex items-center gap-1">
                    <Euro className="h-4 w-4" />
                    {order.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {order.status === 'pending_approval' && (
              <>
                <Button variant="outline" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            
            {order.status === 'approved' && (
              <Button className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Mark as Ordered
              </Button>
            )}
            
            {order.status === 'ordered' && (
              <Button className="flex-1">
                <Package className="h-4 w-4 mr-2" />
                Mark as Received
              </Button>
            )}
            
            {order.status === 'received' && (
              <Button className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
            
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};