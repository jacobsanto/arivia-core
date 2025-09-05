import React, { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDetailedProperties } from "@/hooks/useDetailedProperties";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Home,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";

interface RoomStatusEntry {
  propertyId: string;
  propertyName: string;
  roomStatus: string;
  lastUpdated: string;
  assignedTo?: string;
  nextCheckIn?: string;
  openIssues: number;
  urgentIssues: number;
}

export const RoomStatusManagerEnhanced: React.FC = () => {
  const { properties, isLoading, refetch } = useDetailedProperties();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const roomStatusData = useMemo(() => {
    return properties.map(property => ({
      propertyId: property.id,
      propertyName: property.name,
      roomStatus: property.room_status,
      lastUpdated: new Date().toISOString(),
      assignedTo: undefined, // Will be implemented with user assignment system
      nextCheckIn: undefined, // Will be calculated from actual bookings
      openIssues: property.open_issues_count,
      urgentIssues: property.urgent_issues_count
    }));
  }, [properties]);

  const filteredData = useMemo(() => {
    return roomStatusData.filter(room => {
      const matchesStatus = statusFilter === 'all' || room.roomStatus === statusFilter;
      const matchesAssignee = assigneeFilter === 'all' || room.assignedTo === assigneeFilter;
      return matchesStatus && matchesAssignee;
    });
  }, [roomStatusData, statusFilter, assigneeFilter]);

  const statusCounts = useMemo(() => {
    const counts = roomStatusData.reduce((acc, room) => {
      acc[room.roomStatus] = (acc[room.roomStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      dirty: counts.dirty || 0,
      cleaning: counts.cleaning || 0,
      cleaned: counts.cleaned || 0,
      inspected: counts.inspected || 0,
      ready: counts.ready || 0,
      total: roomStatusData.length
    };
  }, [roomStatusData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'dirty':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cleaning':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'cleaned':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'inspected':
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'default';
      case 'cleaned': return 'secondary';
      case 'cleaning': return 'outline';
      case 'inspected': return 'default';
      case 'dirty': return 'destructive';
      default: return 'outline';
    }
  };

  const updateRoomStatus = async (propertyId: string, newStatus: string) => {
    try {
      // TODO: Implement room status tracking in database
      // For now, just show a message that this feature is coming soon
      toast({
        title: "Feature Coming Soon",
        description: `Room status management will be available soon. Requested status: ${newStatus}`,
        variant: "default",
      });
      console.log(`Room status update requested: Property ${propertyId} to ${newStatus}`);
    } catch (error) {
      console.error('Error updating room status:', error);
      toast({
        title: "Error",
        description: "Failed to update room status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Room Status Manager</h2>
          <p className="text-muted-foreground">
            Monitor and manage room cleaning status across all properties
          </p>
        </div>
        <Button onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'dirty' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'dirty' ? 'all' : 'dirty')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium">Dirty</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{statusCounts.dirty}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'cleaning' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'cleaning' ? 'all' : 'cleaning')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Cleaning</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.cleaning}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'cleaned' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'cleaned' ? 'all' : 'cleaned')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Cleaned</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{statusCounts.cleaned}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'inspected' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'inspected' ? 'all' : 'inspected')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Inspected</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{statusCounts.inspected}</div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === 'ready' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
          onClick={() => setStatusFilter(statusFilter === 'ready' ? 'all' : 'ready')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Ready</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.ready}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{statusCounts.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Room Status Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Room Status Details</CardTitle>
            <div className="flex items-center gap-2">
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="capitalize">
                  Filtered by: {statusFilter}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => setStatusFilter('all')}
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Property</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Next Check-In</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((room) => (
                  <TableRow key={room.propertyId} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">{room.propertyName}</div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(room.roomStatus)}
                        <Badge variant={getStatusBadgeVariant(room.roomStatus)} className="capitalize">
                          {room.roomStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {room.assignedTo ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{room.assignedTo}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(room.lastUpdated).toLocaleString()}
                    </TableCell>
                    
                    <TableCell>
                      {room.nextCheckIn ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(room.nextCheckIn).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No check-in</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {room.openIssues > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={room.urgentIssues > 0 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {room.openIssues}
                          </Badge>
                          {room.urgentIssues > 0 && (
                            <span className="text-xs text-destructive font-medium">
                              {room.urgentIssues} urgent
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {room.roomStatus === 'dirty' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRoomStatus(room.propertyId, 'cleaning')}
                          >
                            Start Cleaning
                          </Button>
                        )}
                        {room.roomStatus === 'cleaning' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRoomStatus(room.propertyId, 'cleaned')}
                          >
                            Mark Cleaned
                          </Button>
                        )}
                        {room.roomStatus === 'cleaned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateRoomStatus(room.propertyId, 'inspected')}
                          >
                            Inspect
                          </Button>
                        )}
                        {room.roomStatus === 'inspected' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => updateRoomStatus(room.propertyId, 'ready')}
                          >
                            Mark Ready
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                {properties.length === 0 ? "No properties found" : "No rooms match your filters"}
              </div>
              <div className="text-sm text-muted-foreground">
                {properties.length === 0 
                  ? "Add properties to the system to start managing room status." 
                  : "Try adjusting your filters to see more results."
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};