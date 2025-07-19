import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, Star, Clock } from 'lucide-react';

export const GuestChatInterface = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const chatList = [
    {
      id: 1,
      guest: "Sarah Johnson",
      property: "Villa Sunset",
      lastMessage: "Thank you! The check-in was smooth.",
      time: "2 min ago",
      unread: 0,
      status: "online",
      priority: "normal"
    },
    {
      id: 2,
      guest: "Mike Chen",
      property: "Villa Azure",
      lastMessage: "The AC in the bedroom is not working properly",
      time: "15 min ago",
      unread: 2,
      status: "away",
      priority: "urgent"
    },
    {
      id: 3,
      guest: "Emma Wilson",
      property: "Villa Marina",
      lastMessage: "What time is check-out tomorrow?",
      time: "1 hour ago",
      unread: 1,
      status: "offline",
      priority: "normal"
    },
    {
      id: 4,
      guest: "David Rodriguez",
      property: "Villa Horizon",
      lastMessage: "Perfect, thank you for the restaurant recommendations!",
      time: "3 hours ago",
      unread: 0,
      status: "online",
      priority: "normal"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "guest",
      content: "Hi! We just arrived and having trouble finding the key box.",
      time: "2:30 PM",
      delivered: true
    },
    {
      id: 2,
      sender: "staff",
      content: "Hello Sarah! Welcome to Villa Sunset. The key box is located next to the main entrance, behind the white pillar. The code is 4829.",
      time: "2:32 PM",
      delivered: true
    },
    {
      id: 3,
      sender: "guest",
      content: "Found it! Thank you so much.",
      time: "2:35 PM",
      delivered: true
    },
    {
      id: 4,
      sender: "staff",
      content: "Wonderful! If you need anything during your stay, please don't hesitate to reach out. Enjoy your time at the villa!",
      time: "2:36 PM",
      delivered: true
    },
    {
      id: 5,
      sender: "guest",
      content: "Thank you! The check-in was smooth.",
      time: "2:45 PM",
      delivered: true
    }
  ];

  const selectedGuest = chatList.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Active Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {chatList.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                  selectedChat === chat.id 
                    ? 'bg-muted border-l-primary' 
                    : 'border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={chat.guest} />
                      <AvatarFallback>{chat.guest.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      chat.status === 'online' ? 'bg-green-500' :
                      chat.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">{chat.guest}</h4>
                      <div className="flex items-center gap-1">
                        {chat.priority === 'urgent' && <Star className="h-3 w-3 text-red-500" />}
                        {chat.unread > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1">{chat.property}</p>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        {selectedGuest && (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt={selectedGuest.guest} />
                    <AvatarFallback>{selectedGuest.guest.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedGuest.guest}</h3>
                    <p className="text-sm text-muted-foreground">{selectedGuest.property}</p>
                  </div>
                  <Badge variant={selectedGuest.status === 'online' ? 'default' : 'secondary'}>
                    {selectedGuest.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender === 'staff'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'staff' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};