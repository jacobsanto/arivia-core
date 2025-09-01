import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Bed, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  MoreVertical,
  Sparkles,
  Eye,
  UserCheck
} from "lucide-react";

// Room status types and colors
const roomStatuses = {
  dirty: { label: "Dirty", icon: XCircle, color: "bg-destructive text-destructive-foreground" },
  cleaning: { label: "Cleaning", icon: Sparkles, color: "bg-warning text-warning-foreground" },
  cleaned: { label: "Cleaned", icon: CheckCircle, color: "bg-success text-success-foreground" },
  inspected: { label: "Inspected", icon: Eye, color: "bg-primary text-primary-foreground" },
  ready: { label: "Guest Ready", icon: UserCheck, color: "bg-success text-success-foreground" },
  maintenance: { label: "Maintenance", icon: AlertCircle, color: "bg-warning text-warning-foreground" },
  blocked: { label: "Blocked", icon: XCircle, color: "bg-destructive text-destructive-foreground" }
};

// Mock room data
const mockRooms = [
  {
    id: "R001",
    name: "Ocean View Suite",
    floor: 1,
    type: "Suite",
    status: "dirty",
    guestCheckOut: "2024-12-31 11:00",
    nextCheckIn: "2025-01-01 15:00",
    assignedTo: "Maria Garcia",
    notes: "Guest reported AC issue"
  },
  {
    id: "R002", 
    name: "Garden Villa",
    floor: 1,
    type: "Villa",
    status: "cleaning",
    guestCheckOut: "2024-12-30 10:30",
    nextCheckIn: "2025-01-02 16:00",
    assignedTo: "John Smith",
    notes: ""
  },
  {
    id: "R003",
    name: "Beach House",
    floor: 2,
    type: "House",
    status: "ready",
    guestCheckOut: "2024-12-29 11:00",
    nextCheckIn: "2025-01-01 14:00",
    assignedTo: "Sarah Wilson",
    notes: "Deep cleaned yesterday"
  },
  {
    id: "R004",
    name: "Pool Side Room",
    floor: 1, 
    type: "Room",
    status: "inspected",
    guestCheckOut: "2024-12-30 12:00",
    nextCheckIn: "2025-01-03 15:00",
    assignedTo: "Mike Johnson",
    notes: "Ready for guest"
  }
];

interface RoomStatusManagerProps {
  propertyId?: string;
}

const RoomStatusManager: React.FC<RoomStatusManagerProps> = ({ propertyId }) => {
  const [selectedView, setSelectedView] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rooms, setRooms] = useState(mockRooms);

  const updateRoomStatus = (roomId: string, newStatus: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
  };

  const filteredRooms = statusFilter === "all" 
    ? rooms 
    : rooms.filter(room => room.status === statusFilter);

  const getStatusStats = () => {
    const stats = Object.keys(roomStatuses).reduce((acc, status) => {
      acc[status] = rooms.filter(room => room.status === status).length;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const stats = getStatusStats();

  const RoomCard = ({ room }: { room: typeof mockRooms[0] }) => {
    const status = roomStatuses[room.status as keyof typeof roomStatuses];
    const StatusIcon = status.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{room.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "cleaning")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Cleaning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "cleaned")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Cleaned
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "inspected")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Mark Inspected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "ready")}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Mark Ready
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "maintenance")}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Needs Maintenance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{room.type}</Badge>
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Room ID:</span>
              <span className="font-medium">{room.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor:</span>
              <span className="font-medium">{room.floor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">{room.assignedTo}</span>
            </div>
          </div>
          
          {room.guestCheckOut && (
            <div className="text-sm">
              <span className="text-muted-foreground">Last Checkout:</span>
              <p className="font-medium">{room.guestCheckOut}</p>
            </div>
          )}
          
          {room.nextCheckIn && (
            <div className="text-sm">
              <span className="text-muted-foreground">Next Check-in:</span>
              <p className="font-medium">{room.nextCheckIn}</p>
            </div>
          )}
          
          {room.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Notes:</span>
              <p className="text-sm text-muted-foreground">{room.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(roomStatuses).map(([key, status]) => {
          const StatusIcon = status.icon;
          return (
            <Card key={key}>
              <CardContent className="p-4 text-center">
                <StatusIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{stats[key] || 0}</div>
                <div className="text-xs text-muted-foreground">{status.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(roomStatuses).map(([key, status]) => (
                <SelectItem key={key} value={key}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Room Display */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Room Status List</CardTitle>
              <CardDescription>
                All rooms with their current status and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRooms.map((room) => {
                  const status = roomStatuses[room.status as keyof typeof roomStatuses];
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={room.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{room.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{room.id}</span>
                            <span>•</span>
                            <span>{room.type}</span>
                            <span>•</span>
                            <span>Floor {room.floor}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <div className="font-medium">{room.assignedTo}</div>
                          {room.nextCheckIn && (
                            <div className="text-muted-foreground">
                              Next: {room.nextCheckIn}
                            </div>
                          )}
                        </div>
                        
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "cleaning")}>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Start Cleaning
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "cleaned")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Cleaned
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoomStatus(room.id, "ready")}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Mark Ready
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoomStatusManager;