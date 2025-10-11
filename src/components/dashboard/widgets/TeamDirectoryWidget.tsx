import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  Circle, 
  MessageSquare, 
  Phone 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  avatar?: string;
}

export const TeamDirectoryWidget: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      // Get all staff profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, role, avatar, updated_at')
        .in('role', ['housekeeping_staff', 'maintenance_staff', 'property_manager']);

      if (!profiles) {
        setTeamMembers([]);
        return;
      }

      // Convert profiles to team members with status calculation
      const members: TeamMember[] = profiles.map(profile => {
        const lastActivity = new Date(profile.updated_at);
        const now = new Date();
        const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        
        let status: 'online' | 'away' | 'offline';
        let lastSeen: string;

        if (hoursSinceActivity < 0.5) {
          status = 'online';
          lastSeen = 'now';
        } else if (hoursSinceActivity < 2) {
          status = 'away';
          lastSeen = `${Math.floor(hoursSinceActivity * 60)} min ago`;
        } else if (hoursSinceActivity < 24) {
          status = 'offline';
          lastSeen = `${Math.floor(hoursSinceActivity)} hour${Math.floor(hoursSinceActivity) > 1 ? 's' : ''} ago`;
        } else {
          status = 'offline';
          const daysSince = Math.floor(hoursSinceActivity / 24);
          lastSeen = `${daysSince} day${daysSince > 1 ? 's' : ''} ago`;
        }

        return {
          id: profile.user_id,
          name: profile.name,
          role: formatRole(profile.role),
          status,
          lastSeen,
          avatar: profile.avatar
        };
      });

      // Sort by status (online first) then by name
      members.sort((a, b) => {
        const statusOrder = { online: 0, away: 1, offline: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return a.name.localeCompare(b.name);
      });

      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'housekeeping_staff': return 'Housekeeping Staff';
      case 'maintenance_staff': return 'Maintenance Staff';
      case 'property_manager': return 'Property Manager';
      case 'administrator': return 'Administrator';
      default: return 'Staff';
    }
  };

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

  const onlineMembers = teamMembers.filter(member => member.status === 'online').length;
  const totalMembers = teamMembers.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Team Directory
            </div>
            <Badge variant="outline">Loading...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {teamMembers.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No team members found
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};