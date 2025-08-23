import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Plus,
  Edit,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

export const CleaningTeamManagement: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState('all');

  const zones = [
    { id: 'all', name: 'All Properties', count: 12 },
    { id: 'santorini', name: 'Santorini Zone', count: 4 },
    { id: 'mykonos', name: 'Mykonos Zone', count: 3 },
    { id: 'crete', name: 'Crete Zone', count: 5 }
  ];

  const staff = [
    {
      id: 1,
      name: 'Maria Konstantinou',
      avatar: '/placeholder.svg',
      zone: 'santorini',
      role: 'Senior Housekeeper',
      status: 'available',
      rating: 4.9,
      todayTasks: 3,
      completedToday: 2,
      phone: '+30 123 456 789',
      email: 'maria@arivia.com',
      specialties: ['Deep Cleaning', 'Luxury Amenities']
    },
    {
      id: 2,
      name: 'John Dimitriou',
      avatar: '/placeholder.svg',
      zone: 'mykonos',
      role: 'Housekeeper',
      status: 'busy',
      rating: 4.7,
      todayTasks: 4,
      completedToday: 1,
      phone: '+30 123 456 790',
      email: 'john@arivia.com',
      specialties: ['Quick Turnovers', 'Maintenance Support']
    },
    {
      id: 3,
      name: 'Anna Papadaki',
      avatar: '/placeholder.svg',
      zone: 'crete',
      role: 'Team Lead',
      status: 'available',
      rating: 5.0,
      todayTasks: 2,
      completedToday: 2,
      phone: '+30 123 456 791',
      email: 'anna@arivia.com',
      specialties: ['Team Coordination', 'Quality Control']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStaff = selectedZone === 'all' 
    ? staff 
    : staff.filter(person => person.zone === selectedZone);

  return (
    <div className="space-y-6">
      {/* Zone Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team by Zone</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {zones.map((zone) => (
            <Button
              key={zone.id}
              variant={selectedZone === zone.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setSelectedZone(zone.id)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{zone.name}</div>
                <div className="text-xs opacity-70">{zone.count} properties</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredStaff.map((person) => (
          <Card key={person.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline">{person.role}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{person.rating}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(person.status)}>
                    {person.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Today's Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Today's Progress</span>
                    <span className="text-muted-foreground">
                      {person.completedToday}/{person.todayTasks} tasks
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(person.completedToday / person.todayTasks) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{person.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{person.email}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Specialties</Label>
                  <div className="flex flex-wrap gap-1">
                    {person.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Zone Coverage Summary</CardTitle>
          <CardDescription>Staff distribution across property zones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {zones.slice(1).map((zone) => {
              const zoneStaff = staff.filter(person => person.zone === zone.id);
              const totalTasks = zoneStaff.reduce((sum, person) => sum + person.todayTasks, 0);
              const completedTasks = zoneStaff.reduce((sum, person) => sum + person.completedToday, 0);
              
              return (
                <div key={zone.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{zone.name}</h4>
                    <Badge variant="outline">{zoneStaff.length} staff</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Today's Tasks</span>
                      <span>{completedTasks}/{totalTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}