
import React from 'react';
import { FEATURE_PERMISSIONS } from "@/types/auth";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PermissionCategoryAccordionProps {
  category: string;
  permKeys: string[];
  permissions: Record<string, boolean>;
  selectedUser: any;
  handlePermissionToggle: (key: string) => void;
}

const PermissionCategoryAccordion: React.FC<PermissionCategoryAccordionProps> = ({
  category,
  permKeys,
  permissions,
  selectedUser,
  handlePermissionToggle
}) => {
  // Count the number of permissions that are enabled
  const enabledPermissionCount = permKeys.filter(key => permissions[key]).length;
  
  return (
    <AccordionItem key={category} value={category}>
      <AccordionTrigger className="hover:bg-muted/50 px-2">
        <span className="flex items-center justify-between w-full pr-4">
          <span>{category}</span>
          <span className="text-sm text-muted-foreground">
            {enabledPermissionCount}/{permKeys.length}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 px-2">
          {permKeys.map(permKey => {
            const permission = FEATURE_PERMISSIONS[permKey];
            if (!permission) return null;
            
            // Check if this permission has been customized from the default
            const defaultPermissions = selectedUser.customPermissions || {};
            const isCustomized = defaultPermissions[permKey] !== undefined;
            const hasAccess = permissions[permKey] || false;
            
            return (
              <div 
                key={permKey} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  isCustomized ? 'bg-blue-50 dark:bg-blue-950/30' : ''
                }`}
              >
                <div className="mr-4">
                  <p className="text-sm font-medium">{permission.title}</p>
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                  {isCustomized && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      (Customized)
                    </span>
                  )}
                </div>
                <Switch 
                  checked={hasAccess} 
                  onCheckedChange={() => handlePermissionToggle(permKey)}
                />
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PermissionCategoryAccordion;
