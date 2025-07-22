import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, User, UserPlus } from 'lucide-react';
import { assignmentService, type AssignableUser, type PropertyAssignment } from '@/services/property/assignment.service';
import type { Property } from '@/types/property.types';

interface PropertyAssignmentManagerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignmentChanged?: () => void;
}

export const PropertyAssignmentManager = ({
  property,
  isOpen,
  onClose,
  onAssignmentChanged
}: PropertyAssignmentManagerProps) => {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [currentAssignments, setCurrentAssignments] = useState<PropertyAssignment[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && property) {
      fetchData();
    }
  }, [isOpen, property]);

  const fetchData = async () => {
    if (!property) return;
    
    setIsLoading(true);
    try {
      const [usersData, assignmentsData] = await Promise.all([
        assignmentService.getAssignableUsers(),
        assignmentService.getPropertyAssignments(property.id)
      ]);
      
      setUsers(usersData);
      setCurrentAssignments(assignmentsData);
      
      // Set currently assigned user IDs
      const assignedIds = assignmentsData.map(a => a.user_id);
      setSelectedUserIds(assignedIds);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSaveAssignments = async () => {
    if (!property) return;
    
    setIsSaving(true);
    try {
      await assignmentService.assignUsersToProperty(property.id, selectedUserIds);
      onAssignmentChanged?.();
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!property) return;
    
    try {
      await assignmentService.removeUserFromProperty(userId, property.id);
      await fetchData();
      onAssignmentChanged?.();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const groupedUsers = users.reduce((acc, user) => {
    const role = user.custom_role?.display_name || user.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(user);
    return acc;
  }, {} as Record<string, AssignableUser[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manage Property Assignments
          </DialogTitle>
          <DialogDescription>
            Assign staff members to {property?.name}. Only assigned users will be able to access this property.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Assignments */}
            {currentAssignments.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Currently Assigned ({currentAssignments.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentAssignments.map((assignment) => (
                    <Badge key={assignment.id} variant="secondary" className="flex items-center gap-1">
                      {assignment.user?.name}
                      <button
                        onClick={() => handleRemoveUser(assignment.user_id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            )}

            {/* User Selection */}
            <div>
              <h4 className="font-medium mb-3">Select Users to Assign</h4>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-4">
                  {Object.entries(groupedUsers).map(([role, roleUsers]) => (
                    <div key={role}>
                      <h5 className="font-medium text-sm mb-2 text-muted-foreground">
                        {role} ({roleUsers.length})
                      </h5>
                      <div className="space-y-2 ml-4">
                        {roleUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={user.id}
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={(checked) => 
                                handleUserToggle(user.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={user.id} className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{user.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Assignment Summary */}
            {selectedUserIds.length > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>{selectedUserIds.length}</strong> user(s) will be assigned to this property
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAssignments} 
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};