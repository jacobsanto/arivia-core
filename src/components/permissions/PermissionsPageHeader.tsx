import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionsPageHeaderProps {
  hasChanges: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}

const PermissionsPageHeader = ({
  hasChanges,
  saving,
  onSave,
  onReset
}: PermissionsPageHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions Management
            </CardTitle>
            <CardDescription>
              Configure role-based access control for all system functions. Changes affect all users with the selected roles.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={!hasChanges || saving}
              className="min-w-[120px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
            
            <Button
              onClick={onSave}
              disabled={!hasChanges || saving}
              className="min-w-[120px]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Super Admin permissions are locked and cannot be modified. 
            Administrator roles maintain most permissions except system-level administration functions.
            Changes take effect immediately after saving.
          </AlertDescription>
        </Alert>
        
        {hasChanges && (
          <Alert className="mt-4 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You have unsaved changes. Click "Save Changes" to apply them or "Reset Changes" to discard.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PermissionsPageHeader;