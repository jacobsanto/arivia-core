
import React from "react";
import { UserRole, ROLE_DETAILS } from "@/types/auth";
import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoleEditFormProps {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  selectedSecondaryRoles: UserRole[];
  toggleSecondaryRole: (role: UserRole) => void;
  handleCancelEdit: () => void;
  handleSaveRole: () => Promise<void>;
  isSaving: boolean;
}

const RoleEditForm: React.FC<RoleEditFormProps> = ({
  selectedRole,
  setSelectedRole,
  selectedSecondaryRoles,
  toggleSecondaryRole,
  handleCancelEdit,
  handleSaveRole,
  isSaving
}) => {
  return (
    <>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Select Role</p>
          <Select 
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_DETAILS).map(([role, details]) => (
                <SelectItem key={role} value={role}>{details.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedRole === "superadmin" && (
          <div className="p-3 border rounded-md space-y-3">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">
                Super Admin requires at least one secondary role
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(ROLE_DETAILS)
                .filter(([role]) => role !== "superadmin") // Exclude superadmin from secondary roles
                .map(([role, details]) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mobile-role-${role}`} 
                      checked={selectedSecondaryRoles.includes(role as UserRole)} 
                      onCheckedChange={() => toggleSecondaryRole(role as UserRole)}
                    />
                    <label htmlFor={`mobile-role-${role}`} className="text-sm">
                      {details.title}
                    </label>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-3">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleCancelEdit}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSaveRole}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </>
  );
};

export default RoleEditForm;
