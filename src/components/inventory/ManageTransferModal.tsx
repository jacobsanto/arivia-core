import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  MapPin, 
  User, 
  Clock, 
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface ManageTransferModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: any;
}

export const ManageTransferModal: React.FC<ManageTransferModalProps> = ({
  isOpen,
  onOpenChange,
  transfer
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'in_transit': return 'In Transit';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (!transfer) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Create Transfer Request
            </DialogTitle>
            <DialogDescription>
              Request transfer of inventory between locations
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            <p>Transfer creation form coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Transfer Details - {transfer.transfer_number}
          </DialogTitle>
          <DialogDescription>
            View and manage inventory transfer request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">From Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{transfer.from_location}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">To Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{transfer.to_location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Requested By</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{transfer.requested_by}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(transfer.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(transfer.status)}
                      {getStatusLabel(transfer.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requested Date</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(transfer.requested_at), 'PPP p')}</span>
                </div>
              </div>

              {transfer.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{transfer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({transfer.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transfer.items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.item_name}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          Requested: {item.quantity_requested} units
                          {item.quantity_approved && item.quantity_approved !== item.quantity_requested && (
                            <span className="ml-2">
                              • Approved: {item.quantity_approved} units
                            </span>
                          )}
                        </div>
                      </div>
                      {item.unit_cost && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Unit Cost</div>
                          <div className="font-medium">€{item.unit_cost}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {transfer.status === 'pending_approval' && (
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
            
            {transfer.status === 'approved' && (
              <Button className="flex-1">
                <Truck className="h-4 w-4 mr-2" />
                Mark In Transit
              </Button>
            )}
            
            {transfer.status === 'in_transit' && (
              <Button className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Completed
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