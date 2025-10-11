// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  Globe,
  Building,
  MapPin,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import { CleaningTemplate } from '@/hooks/useAdvancedCleaningSystem';

interface Property {
  id: string;
  title: string;
  property_type?: string;
  status?: string;
  address?: any;
}

interface BulkConfigurationManagerProps {
  templates: CleaningTemplate[];
  onClose: () => void;
  onSave: () => void;
}

export const BulkConfigurationManager: React.FC<BulkConfigurationManagerProps> = ({
  templates,
  onClose,
  onSave
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('guesty_listings')
        .select('id, title, property_type, status, address')
        .eq('is_deleted', false)
        .order('title');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      logger.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    const matchesType = filterType === 'all' || property.property_type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleBulkAssign = async () => {
    if (!selectedTemplate || selectedProperties.length === 0) return;

    try {
      const assignments = selectedProperties.map(propertyId => ({
        template_id: selectedTemplate,
        listing_id: propertyId
      }));

      const { error } = await supabase
        .from('configuration_assignments')
        .upsert(assignments, { onConflict: 'template_id,listing_id' });

      if (error) throw error;

      onSave();
    } catch (error) {
      logger.error('Error assigning template:', error);
    }
  };

  const propertyTypes = [...new Set(properties.map(p => p.property_type).filter(Boolean))];
  const statuses = [...new Set(properties.map(p => p.status).filter(Boolean))];

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Configuration Manager
          </DialogTitle>
          <DialogDescription>
            Apply cleaning configurations to multiple properties at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Template</CardTitle>
              <CardDescription>
                Choose a template to apply to selected properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cleaning template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.is_global ? (
                          <Globe className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Building className="h-4 w-4 text-green-500" />
                        )}
                        <span>{template.name}</span>
                        <Badge variant={template.is_global ? "default" : "secondary"} className="text-xs">
                          {template.is_global ? 'Global' : 'Custom'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Selection</CardTitle>
              <CardDescription>
                Filter and select properties to configure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {selectedProperties.length === filteredProperties.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedProperties.length === filteredProperties.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedProperties.length} of {filteredProperties.length} properties selected
                  </span>
                  {filteredProperties.length !== properties.length && (
                    <Badge variant="outline">
                      Filtered from {properties.length} total
                    </Badge>
                  )}
                </div>
                {selectedProperties.length > 0 && (
                  <Badge variant="default">
                    Ready to configure
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property List */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Properties</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-96">
              <div className="space-y-1">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <Checkbox
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={() => handlePropertyToggle(property.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium truncate">{property.title}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {property.property_type && (
                          <Badge variant="outline" className="text-xs">
                            {property.property_type}
                          </Badge>
                        )}
                        {property.status && (
                          <Badge variant="secondary" className="text-xs">
                            {property.status}
                          </Badge>
                        )}
                        {property.address?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{property.address.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredProperties.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No properties match the current filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedProperties.length > 0 && selectedTemplate && (
                <span>
                  Ready to apply template to {selectedProperties.length} propert{selectedProperties.length === 1 ? 'y' : 'ies'}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkAssign}
                disabled={!selectedTemplate || selectedProperties.length === 0}
              >
                Apply Configuration ({selectedProperties.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};