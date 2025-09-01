import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Truck, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  XCircle,
  MapPin,
  User,
  Package
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { ManageTransferModal } from "./ManageTransferModal";
import { format } from "date-fns";

export const InventoryTransfersView: React.FC = () => {
  const { 
    transfers, 
    transferFilters, 
    setTransferFilters, 
    transfersLoading 
  } = useInventory();
  
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isManageTransferOpen, setIsManageTransferOpen] = useState(false);
  const [isCreateTransferOpen, setIsCreateTransferOpen] = useState(false);

  const handleStatusFilter = (value: string) => {
    setTransferFilters(prev => ({ ...prev, status: value }));
  };

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

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer);
    setIsManageTransferOpen(true);
  };

  const handleCreateTransfer = () => {
    setSelectedTransfer(null);
    setIsCreateTransferOpen(true);
  };

  if (transfersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Inventory Transfers
              </CardTitle>
              <CardDescription>
                Manage internal movement of inventory between locations
              </CardDescription>
            </div>
            <Button onClick={handleCreateTransfer}>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <Select value={transferFilters.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-muted-foreground">
              {transfers.length} transfer{transfers.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfers Table */}
      <Card>
        <CardContent className="p-6">
          {transfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No transfers found</h3>
              <p>Create a new transfer request to move inventory between locations.</p>
              <Button onClick={handleCreateTransfer} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Transfer Request
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div className="font-medium">{transfer.transfer_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{transfer.from_location}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{transfer.to_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transfer.items.length}</span>
                          <span className="text-sm text-muted-foreground">
                            item{transfer.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{transfer.requested_by}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(transfer.requested_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(transfer.requested_at), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(transfer.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(transfer.status)}
                          {getStatusLabel(transfer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTransfer(transfer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Transfer Modal */}
      <ManageTransferModal
        isOpen={isManageTransferOpen}
        onOpenChange={setIsManageTransferOpen}
        transfer={selectedTransfer}
      />
      
      <ManageTransferModal
        isOpen={isCreateTransferOpen}
        onOpenChange={setIsCreateTransferOpen}
        transfer={null}
      />
    </div>
  );
};