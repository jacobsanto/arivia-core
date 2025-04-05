
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger, 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, MessageSquare, Phone, Search, User, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

// Sample guest data
const sampleGuests = [
  {
    id: 1,
    name: "John & Sarah Miller",
    email: "john.miller@example.com",
    phone: "+1 234-567-8901",
    status: "Current",
    checkIn: "2025-04-01",
    checkOut: "2025-04-08",
    stays: 3,
    notes: "Celebrating anniversary. Prefer quiet room."
  },
  {
    id: 2,
    name: "Roberto Garcia",
    email: "rgarcia@example.com",
    phone: "+34 612-345-678",
    status: "Upcoming",
    checkIn: "2025-04-09",
    checkOut: "2025-04-15",
    stays: 1,
    notes: "Business trip. Requested early check-in."
  },
  {
    id: 3,
    name: "Emma Thompson",
    email: "emma.t@example.com",
    phone: "+44 20-1234-5678",
    status: "Past",
    checkIn: "2024-12-12",
    checkOut: "2024-12-19",
    stays: 2,
    notes: "Repeat guest. Loves the ocean view."
  },
  {
    id: 4,
    name: "Michael & Laura Chen",
    email: "mchen@example.com",
    phone: "+1 415-555-7890",
    status: "Past",
    checkIn: "2024-10-05",
    checkOut: "2024-10-12",
    stays: 1,
    notes: "Food allergies noted in welcome package."
  },
];

// Sample communications
const sampleCommunications = [
  {
    id: 1,
    guestId: 1,
    date: "2025-03-15",
    type: "Email",
    subject: "Booking Confirmation",
    preview: "Your stay at Villa Caldera has been confirmed for April 1-8, 2025..."
  },
  {
    id: 2,
    guestId: 1,
    date: "2025-03-20",
    type: "SMS",
    subject: "Pre-arrival Information",
    preview: "We look forward to welcoming you to Villa Caldera. Here's some information..."
  },
  {
    id: 3,
    guestId: 2,
    date: "2025-03-25",
    type: "Email",
    subject: "Booking Confirmation",
    preview: "Your stay at Villa Caldera has been confirmed for April 9-15, 2025..."
  },
  {
    id: 4,
    guestId: 3,
    date: "2024-12-01",
    type: "Email",
    subject: "Booking Confirmation",
    preview: "Your stay at Villa Caldera has been confirmed for December 12-19, 2024..."
  },
];

interface GuestManagementProps {
  property: any;
  onBack: () => void;
}

const GuestManagement = ({ property, onBack }: GuestManagementProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  
  // Filter guests based on search and tab
  const filteredGuests = sampleGuests.filter((guest) => {
    // Filter by search query
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery);

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "current" && guest.status === "Current") ||
      (activeTab === "upcoming" && guest.status === "Upcoming") ||
      (activeTab === "past" && guest.status === "Past");

    return matchesSearch && matchesTab;
  });
  
  const guestCommunications = (guestId: number) => {
    return sampleCommunications.filter(comm => comm.guestId === guestId);
  };
  
  const handleSendMessage = (guest: any) => {
    toast.info(`Message would be sent to ${guest.name} at ${guest.email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{property.name}</h2>
          <p className="text-muted-foreground">Guest Management</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guests..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          defaultValue="all"
          className="w-full sm:w-auto"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Guests</CardTitle>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stay Period</TableHead>
                <TableHead>Past Stays</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{guest.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{guest.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs 
                      ${guest.status === 'Current' ? 'bg-green-100 text-green-800' : 
                      guest.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                      {guest.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {guest.checkIn} to {guest.checkOut}
                  </TableCell>
                  <TableCell>{guest.stays}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleSendMessage(guest)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8"
                            onClick={() => setSelectedGuest(guest)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{guest.name} - Guest Details</DialogTitle>
                          </DialogHeader>
                          <GuestDetailView 
                            guest={guest} 
                            communications={guestCommunications(guest.id)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface GuestDetailViewProps {
  guest: any;
  communications: any[];
}

const GuestDetailView = ({ guest, communications }: GuestDetailViewProps) => {
  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{guest.name}</h3>
              <div className="flex flex-col text-sm text-muted-foreground">
                <span>{guest.email}</span>
                <span>{guest.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current/Latest Stay</h4>
            <div className="bg-muted rounded-md p-3">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-medium">{guest.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-medium">{guest.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${
                  guest.status === 'Current' ? 'text-green-600' : 
                  guest.status === 'Upcoming' ? 'text-blue-600' : 
                  'text-gray-600'}`}>
                  {guest.status}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <h5 className="text-xs font-medium mb-1">Notes</h5>
                <p className="text-xs">{guest.notes}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <h4 className="text-sm font-medium">Guest History</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {guest.stays > 1 
                ? `Returning guest with ${guest.stays} total stays` 
                : "First-time guest"}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Communication History</h4>
          {communications.length > 0 ? (
            <div className="space-y-2">
              {communications.map((comm) => (
                <div key={comm.id} className="bg-muted rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1">
                        {comm.type === 'Email' ? 
                          <Mail className="h-3 w-3" /> : 
                          <MessageSquare className="h-3 w-3" />
                        }
                        <span className="font-medium">{comm.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{comm.date}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                      {comm.type}
                    </span>
                  </div>
                  <p className="text-xs mt-2">{comm.preview}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No communications found.</p>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send SMS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestManagement;
