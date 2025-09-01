import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PermissionCategory, PermissionMatrix, AppRole, ROLE_LABELS } from '@/types/permissions.types';
import { Shield, Lock } from 'lucide-react';

interface PermissionMatrixTableProps {
  categories: PermissionCategory[];
  permissionMatrix: PermissionMatrix;
  onTogglePermission: (permissionKey: string, role: AppRole) => void;
}

const PermissionMatrixTable = ({
  categories,
  permissionMatrix,
  onTogglePermission
}: PermissionMatrixTableProps) => {
  const roles: AppRole[] = ['superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'guest'];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      system: 'bg-red-100 text-red-800 border-red-200',
      users: 'bg-blue-100 text-blue-800 border-blue-200',
      tasks: 'bg-green-100 text-green-800 border-green-200',
      properties: 'bg-purple-100 text-purple-800 border-purple-200',
      inventory: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reports: 'bg-orange-100 text-orange-800 border-orange-200',
      dashboard: 'bg-gray-100 text-gray-800 border-gray-200',
      finance: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[300px] font-semibold">Permission</TableHead>
            {roles.map(role => (
              <TableHead key={role} className="text-center min-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">{ROLE_LABELS[role]}</span>
                  {role === 'superadmin' && (
                    <Shield className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => (
            <React.Fragment key={category.category}>
              {/* Category Header */}
              <TableRow>
                <TableCell colSpan={roles.length + 1} className="bg-muted/30 py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(category.category)}>
                      {category.category.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {category.permissions.length} permission{category.permissions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              
              {/* Permission Rows */}
              {category.permissions.map(permission => (
                <TableRow key={permission.permission_key} className="hover:bg-muted/50">
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="font-medium">{permission.permission_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {permission.description}
                      </div>
                    </div>
                  </TableCell>
                  
                  {roles.map(role => {
                    const isGranted = permissionMatrix[permission.permission_key]?.[role] || false;
                    const isSuperadmin = role === 'superadmin';
                    const isAdminLocked = role === 'administrator' && permission.permission_key === 'systemAdmin';
                    const isDisabled = isSuperadmin; // Superadmin permissions are always locked
                    
                    return (
                      <TableCell key={role} className="text-center py-4">
                        <div className="flex items-center justify-center">
                          {isDisabled ? (
                            <div className="flex items-center gap-1">
                              <Checkbox
                                checked={isSuperadmin || isGranted}
                                disabled={true}
                                className="pointer-events-none"
                              />
                              {isSuperadmin && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          ) : (
                            <Checkbox
                              checked={isGranted}
                              onCheckedChange={() => onTogglePermission(permission.permission_key, role)}
                              disabled={isAdminLocked}
                              className={isAdminLocked ? 'pointer-events-none opacity-50' : ''}
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionMatrixTable;