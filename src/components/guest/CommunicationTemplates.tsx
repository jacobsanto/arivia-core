import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Copy, Trash2, MessageSquare, Mail, Phone } from 'lucide-react';

export const CommunicationTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);

  const templates = [
    {
      id: 1,
      name: "Welcome & Check-in Instructions",
      category: "arrival",
      channel: "SMS + Email",
      content: "Welcome to {villa_name}! Your check-in details: Code: {door_code}, WiFi: {wifi_password}. Need help? Call us at {phone}.",
      variables: ["villa_name", "door_code", "wifi_password", "phone"],
      usage: 156
    },
    {
      id: 2,
      name: "Maintenance Issue Response",
      category: "support",
      channel: "SMS",
      content: "Thank you for reporting the {issue_type}. Our maintenance team will address this within {response_time}. Reference: {ticket_id}",
      variables: ["issue_type", "response_time", "ticket_id"],
      usage: 43
    },
    {
      id: 3,
      name: "Weather Alert",
      category: "alerts",
      channel: "WhatsApp",
      content: "Weather alert for {location}: {weather_condition} expected. Please secure outdoor items and stay safe. Villa emergency contact: {emergency_phone}",
      variables: ["location", "weather_condition", "emergency_phone"],
      usage: 12
    },
    {
      id: 4,
      name: "Checkout Reminder",
      category: "departure",
      channel: "Email",
      content: "Your stay at {villa_name} ends today at {checkout_time}. Please leave keys in the lock box. Thank you for choosing Arivia Villas!",
      variables: ["villa_name", "checkout_time"],
      usage: 134
    },
    {
      id: 5,
      name: "Post-Stay Review Request",
      category: "feedback",
      channel: "Email",
      content: "Thank you for staying at {villa_name}! We'd love your feedback. Please rate your experience: {review_link}. Special offer for your next stay: {promo_code}",
      variables: ["villa_name", "review_link", "promo_code"],
      usage: 89
    }
  ];

  const categories = [
    { value: 'all', label: 'All Templates', count: templates.length },
    { value: 'arrival', label: 'Arrival & Check-in', count: templates.filter(t => t.category === 'arrival').length },
    { value: 'support', label: 'Guest Support', count: templates.filter(t => t.category === 'support').length },
    { value: 'alerts', label: 'Alerts & Notices', count: templates.filter(t => t.category === 'alerts').length },
    { value: 'departure', label: 'Departure & Check-out', count: templates.filter(t => t.category === 'departure').length },
    { value: 'feedback', label: 'Reviews & Feedback', count: templates.filter(t => t.category === 'feedback').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getChannelIcon = (channel: string) => {
    if (channel.includes('SMS')) return <MessageSquare className="h-4 w-4" />;
    if (channel.includes('Email')) return <Mail className="h-4 w-4" />;
    if (channel.includes('WhatsApp')) return <Phone className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Communication Templates</h3>
          <p className="text-sm text-muted-foreground">Pre-written messages for common guest interactions</p>
        </div>
        <Button onClick={() => setShowCreateTemplate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label} ({category.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Form */}
      {showCreateTemplate && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input id="templateName" placeholder="e.g., Welcome Message" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrival">Arrival & Check-in</SelectItem>
                    <SelectItem value="support">Guest Support</SelectItem>
                    <SelectItem value="alerts">Alerts & Notices</SelectItem>
                    <SelectItem value="departure">Departure & Check-out</SelectItem>
                    <SelectItem value="feedback">Reviews & Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Communication Channel</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms-email">SMS + Email</SelectItem>
                  <SelectItem value="all">All Channels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea 
                id="content"
                placeholder="Your message template... Use {variable_name} for dynamic content"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use curly braces for variables: {"{guest_name}, {villa_name}, {check_in_time}"}, etc.
              </p>
            </div>

            <div className="flex gap-2">
              <Button>Create Template</Button>
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{template.name}</h4>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getChannelIcon(template.channel)}
                      {template.channel}
                    </Badge>
                    <Badge variant="secondary">{template.usage} uses</Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {"{" + variable + "}"}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" title="Copy template">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Edit template">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" title="Delete template">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">Import Templates</Button>
          <Button size="sm" variant="outline">Export Templates</Button>
          <Button size="sm" variant="outline">Bulk Edit</Button>
          <Button size="sm" variant="outline">Usage Analytics</Button>
        </CardContent>
      </Card>
    </div>
  );
};