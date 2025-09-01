import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Circle, 
  MessageSquare, 
  Phone 
} from "lucide-react";

// Mock data for team directory
const teamMembers = [
  {
    id: '1',
    name: 'Maria Garcia',
    role: 'Housekeeping Manager',
    status: 'online',
    lastSeen: 'now',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '2',
    name: 'John Smith',
    role: 'Maintenance Tech',
    status: 'online',
    lastSeen: '5 min ago',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '3',
    name: 'Sarah Wilson',
    role: 'Property Manager',
    status: 'away',
    lastSeen: '1 hour ago',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '4',
    name: 'Mike Johnson',
    role: 'Maintenance Staff',
    status: 'offline',
    lastSeen: '2 hours ago',
    avatar: '/placeholder-avatar.jpg'
  },
  {
    id: '5',
    name: 'Elena Rodriguez',
    role: 'Housekeeping Staff',
    status: 'online',
    lastSeen: 'now',
    avatar: '/placeholder-avatar.jpg'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'text-green-500';
    case 'away': return 'text-yellow-500';
    case 'offline': return 'text-gray-500';
    default: return 'text-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'Online';
    case 'away': return 'Away';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
};

export const TeamDirectoryWidget: React.FC = () => {
  const onlineMembers = teamMembers.filter(member => member.status === 'online').length;
  const totalMembers = teamMembers.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Team Directory
          </div>
          <Badge variant="outline">
            {onlineMembers}/{totalMembers} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Circle 
                  className={`absolute -bottom-1 -right-1 h-3 w-3 ${getStatusColor(member.status)} fill-current`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">{member.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(member.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {member.role} • Last seen {member.lastSeen}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-muted rounded">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-muted rounded">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};