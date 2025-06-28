
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export const SecurityEnhancements: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Enhanced security features are now enabled:
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Email confirmation required for new accounts</li>
            <li>• Minimum password length of 8 characters</li>
            <li>• Password leak detection enabled</li>
            <li>• Anonymous sign-ins disabled</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
