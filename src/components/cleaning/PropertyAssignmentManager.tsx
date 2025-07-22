
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Building } from 'lucide-react';
import { useRuleBasedCleaningSystem, CleaningRule } from '@/hooks/useRuleBasedCleaningSystem';
import { guestyService } from '@/services/guesty/guesty.service';

interface PropertyAssignmentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CleaningRule[];
}

export const PropertyAssignmentManager: React.FC<PropertyAssignmentManagerProps> = ({ 
  isOpen, 
  onClose, 
  rules 
}) => {
  const { assignRuleToProperties, assignments } = useRuleBasedCleaningSystem();
  const [selectedRule, setSelectedRule] = useState<string>('');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchProperties = async () => {
      try {
        const listings = await guestyService.getGuestyListings();
        setProperties(listings || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      }
    };

    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  const handleAssignRule = async () => {
    if (!selectedRule || selectedProperties.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await assignRuleToProperties(selectedRule, selectedProperties);
      setSelectedRule('');
      setSelectedProperties([]);
      onClose();
    } catch (error) {
      console.error('Error assigning rule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyAssignments = (propertyId: string) => {
    return assignments.filter(a => a.property_id === propertyId && a.is_active);
  };

  const availableRules = rules.filter(r => !r.is_global && r.is_active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Rule Assignments
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assign Rule to Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Rule</label>
                <Select value={selectedRule} onValueChange={setSelectedRule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a rule to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRules.map(rule => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.rule_name} ({rule.stay_length_range[0]}-{rule.stay_length_range[1]} nights)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Select Properties</label>
                <div className="mt-2 max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {properties.map(property => (
                    <div key={property.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assign-${property.id}`}
                        checked={selectedProperties.includes(property.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProperties(prev => [...prev, property.id]);
                          } else {
                            setSelectedProperties(prev => prev.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <label htmlFor={`assign-${property.id}`} className="text-sm flex-1">
                        {property.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAssignRule} 
                disabled={!selectedRule || selectedProperties.length === 0 || loading}
                className="w-full"
              >
                {loading ? 'Assigning...' : `Assign Rule to ${selectedProperties.length} Properties`}
              </Button>
            </CardContent>
          </Card>

          {/* Current Assignments Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Current Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {properties.map(property => {
                  const propertyAssignments = getPropertyAssignments(property.id);
                  return (
                    <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{property.title}</p>
                        <p className="text-sm text-muted-foreground">ID: {property.id}</p>
                      </div>
                      <div className="flex gap-2">
                        {propertyAssignments.length > 0 ? (
                          propertyAssignments.map(assignment => {
                            const rule = rules.find(r => r.id === assignment.rule_id);
                            return (
                              <Badge key={assignment.id} variant="default">
                                {rule?.rule_name || 'Unknown Rule'}
                              </Badge>
                            );
                          })
                        ) : (
                          <Badge variant="outline">No assignments</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
