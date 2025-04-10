
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
  return (
    <AccordionItem key={category} value={category}>
      <AccordionTrigger className="hover:bg-muted/50 px-2">
        {category} ({permKeys.filter(key => permissions[key]).length}/{permKeys.length})
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 px-2">
          {permKeys.map(permKey => {
            const permission = FEATURE_PERMISSIONS[permKey];
            if (!permission) return null;
            
            const isCustomized = selectedUser.customPermissions?.[permKey] !== undefined;
            const hasAccess = permissions[permKey] || false;
            
            return (
              <div 
                key={permKey} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  isCustomized ? 'bg-blue-50' : ''
                }`}
              >
                <div className="mr-4">
                  <p className="text-sm font-medium">{permission.title}</p>
                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                  {isCustomized && (
                    <span className="text-xs text-blue-600">(Customized)</span>
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
