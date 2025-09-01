import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatUser } from '@/types/chat.types';
import { MessageSquare, UserPlus, Phone, Video, MoreHorizontal, Circle } from 'lucide-react';

interface TeamMemberListProps {
  members: ChatUser[];
  currentUserId?: string;
  onStartDirectMessage: (userId: string) => void;
  onStartCall?: (userId: string) => void;
  onStartVideoCall?: (userId: string) => void;
  className?: string;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  currentUserId,
  onStartDirectMessage,
  onStartCall,
  onStartVideoCall,
  className = ""
}) => {
  const otherMembers = members.filter(member => member.id !== currentUserId);

  const getMemberInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
      case 'superadmin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'property_manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'maintenance_staff':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'housekeeping_staff':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Team Members ({otherMembers.length})
        </h3>
      </div>

      <div className="space-y-2">
        {otherMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* Avatar with online status */}
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getMemberInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              {member.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background">
                  <Circle className="w-full h-full text-green-500 fill-current" />
                </div>
              )}
            </div>

            {/* Member info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                {member.isOnline ? (
                  <span className="text-xs text-green-600 font-medium">Online</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {member.lastSeen ? `Last seen ${member.lastSeen}` : 'Offline'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(member.role)}`}
                >
                  {formatRole(member.role)}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {member.email}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onStartDirectMessage(member.id)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send direct message</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStartDirectMessage(member.id)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onStartCall && (
                    <DropdownMenuItem onClick={() => onStartCall(member.id)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Voice call
                    </DropdownMenuItem>
                  )}
                  {onStartVideoCall && (
                    <DropdownMenuItem onClick={() => onStartVideoCall(member.id)}>
                      <Video className="h-4 w-4 mr-2" />
                      Video call
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {otherMembers.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other team members available</p>
          </div>
        )}
      </div>
    </div>
  );
};