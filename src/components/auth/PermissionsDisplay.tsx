
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, AlertCircle } from 'lucide-react';
import { FEATURE_PERMISSIONS, ROLE_DETAILS } from '@/types/auth';
import { useIsMobile } from "@/hooks/use-mobile";
import MobilePermissionsDisplay from './MobilePermissionsDisplay';

const PermissionsDisplay = () => {
  const { user } = useUser();
  const { canAccess, getOfflineCapabilities, getAllPermissionsList } = usePermissions();
  const isMobile = useIsMobile();
  
  if (!user) return null;

  // Use the mobile-specific component for mobile devices
  if (isMobile) {
    return <MobilePermissionsDisplay />;
  }
  
  const roleDetails = ROLE_DETAILS[user.role as keyof typeof ROLE_DETAILS] || { title: user.role };
  const offlineCapabilities = getOfflineCapabilities();
  const allPermissions = getAllPermissionsList();
  
  // Check if user has custom permissions
  const hasCustomPermissions = user.custom_permissions && Object.keys(user.custom_permissions).length > 0;
  
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
          <CardDescription>
            Access levels for {roleDetails.title}
            {hasCustomPermissions && " (with custom permissions)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasCustomPermissions && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md flex gap-2 text-sm">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700">You have custom permissions</p>
                <p className="text-blue-600">Your access rights have been customized beyond your role's default permissions</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {Object.entries(permissionGroups).map(([group, features]) => (
              <div key={group}>
                <h4 className="text-sm font-semibold mb-2">{group}</h4>
                <div className="space-y-1">
                  {features.map(feature => {
                    // Check if the feature exists in FEATURE_PERMISSIONS
                    const permission = FEATURE_PERMISSIONS[feature];
                    
                    // If the permission doesn't exist, skip rendering this item
                    if (!permission) return null;
                    
                    const hasAccess = canAccess(feature);
                    const isCustomized = user.custom_permissions && 
                                         user.custom_permissions[feature] !== undefined;
                    
                    return (
                      <div 
                        key={feature} 
                        className={`flex justify-between items-center p-2 rounded-sm ${
                          isCustomized 
                            ? hasAccess ? 'bg-blue-50' : 'bg-gray-100 border border-gray-200' 
                            : hasAccess ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{permission.title}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                          {isCustomized && (
                            <span className="text-xs text-blue-600">(Custom)</span>
                          )}
                        </div>
                        {hasAccess ? (
                          <Check className={`h-5 w-5 ${isCustomized ? 'text-blue-600' : 'text-green-600'}`} />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Offline Capabilities</CardTitle>
          <CardDescription>
            What you can do when offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {offlineCapabilities.map((capability, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsDisplay;
