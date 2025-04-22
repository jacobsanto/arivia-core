
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Book, MessageSquare, Paperclip, Star } from "lucide-react";

// Utility: Format date as dd MMM yyyy
import { format } from "date-fns";
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

export type Guest = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  check_in: string;
  check_out: string;
  isVip?: boolean;
  notes?: string;
};

export interface GuestCardProps {
  guest: Guest;
  onWelcomeKit: (guest: Guest) => void;
  onCustomMessage: (guest: Guest) => void;
  onSendHandbook: (guest: Guest) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  onWelcomeKit,
  onCustomMessage,
  onSendHandbook
}) => {
  const nameParts = (guest.name || 'Guest').split(' ');
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : guest.name?.[0] || 'G';

  return (
    <Card className="mb-3">
      <CardContent className="flex flex-col p-4 gap-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold truncate">{guest.name}</span>
              {guest.isVip && (
                <Badge variant="secondary" className="px-2 py-0.5">
                  <Star className="h-3 w-3 mr-1" /> VIP
                </Badge>
              )}
              {guest.notes && (
                <Badge variant="outline" className="ml-1">{guest.notes}</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {guest.email && (
                <span className="mr-3 inline-flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {guest.email}
                </span>
              )}
              {guest.phone && (
                <span className="inline-flex items-center">
                  <Paperclip className="w-4 h-4 mr-1" />
                  {guest.phone}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs">
              <b>Stay:</b> {formatDate(guest.check_in)} - {formatDate(guest.check_out)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onWelcomeKit(guest)}
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Send Welcome Kit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => onCustomMessage(guest)}
          >
            <Book className="w-4 h-4 mr-1.5" />
            Send Custom Message
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => onSendHandbook(guest)}
          >
            <Paperclip className="w-4 h-4 mr-1.5" />
            Send Handbook
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestCard;
