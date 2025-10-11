
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FEATURE_PERMISSIONS, ROLE_DETAILS } from '@/types/auth';

const MobilePermissionsDisplay = () => {
  const { user } = useAuth();
  const { canAccess, getOfflineCapabilities } = usePermissions();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  
  if (!user) return null;

  const roleDetails = ROLE_DETAILS[user.role];
  const offlineCapabilities = getOfflineCapabilities();
  
  // Check if user has custom permissions
  const hasCustomPermissions = user.customPermissions && Object.keys(user.customPermissions).length > 0;
  
  // Group permissions by category
  const permissionGroups = {
    "Properties": [
      "viewProperties",
      "manageProperties"
    ],
    "Tasks": [
      "viewAllTasks",
      "viewAssignedTasks",
      "assignTasks"
    ],
    "Inventory": [
      "viewInventory",
      "manageInventory",
      "approveTransfers"
    ],
    "Users": [
      "viewUsers",
      "manageUsers"
    ],
    "System": [
      "manageSettings",
      "viewReports"
    ]
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="space-y-4">
      {hasCustomPermissions && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md flex gap-2 text-xs">
          <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-700">Custom permissions enabled</p>
            <p className="text-blue-600">Your access rights have been customized</p>
          </div>
        </div>
      )}
      
      {Object.entries(permissionGroups).map(([group, features]) => {
        // Count how many permissions the user has in this group
        const accessCount = features.filter(feature => 
          FEATURE_PERMISSIONS[feature] && canAccess(feature)
        ).length;
        
        return (
          <Collapsible 
            key={group}
            open={openSections[group]} 
            onOpenChange={() => toggleSection(group)}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger className="w-full p-3 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{group}</h3>
                <p className="text-xs text-muted-foreground">{accessCount} of {features.length} permissions</p>
              </div>
              {openSections[group] ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 pt-1 space-y-2">
                {features.map(feature => {
                  // Check if the feature exists in FEATURE_PERMISSIONS
                  const permission = FEATURE_PERMISSIONS[feature];
                  
                  // If the permission doesn't exist, skip rendering this item
                  if (!permission) return null;
                  
                  const hasAccess = canAccess(feature);
                  const isCustomized = user.customPermissions && 
                                       user.customPermissions[feature] !== undefined;
                  
                  return (
                    <div 
                      key={feature} 
                      className={`flex justify-between items-center p-2 rounded-sm text-xs ${
                        isCustomized 
                          ? hasAccess ? 'bg-blue-50' : 'bg-gray-100' 
                          : hasAccess ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{permission.title}</p>
                        <p className="text-muted-foreground text-[10px]">{permission.description}</p>
                      </div>
                      {hasAccess ? (
                        <Check className={`h-4 w-4 ${isCustomized ? 'text-blue-600' : 'text-green-600'}`} />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      
      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-lg">Offline Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <div className="grid grid-cols-2 gap-2">
            {offlineCapabilities.map((capability, index) => (
              <div 
                key={index} 
                className="bg-green-50 p-2 rounded-md text-sm flex items-center gap-1"
              >
                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800">{capability}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePermissionsDisplay;
