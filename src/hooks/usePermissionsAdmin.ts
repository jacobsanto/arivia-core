// Legacy compatibility file - provides stub implementations for old permission system
// This file maintains backward compatibility while the new system is being implemented

import { useState, useEffect } from 'react';
import { SystemPermission, PermissionMatrix, AppRole } from '@/types/permissions.types';

export const usePermissionsAdmin = () => {
  const [matrix, setMatrix] = useState<PermissionMatrix>({ category: '', permissions: [] });
  const [roleMatrix, setRoleMatrix] = useState<PermissionMatrix>({ category: '', permissions: [] });
  const [loading, setLoading] = useState(false);

  const fetchMatrix = async () => {
    // Stub implementation
    return { category: '', permissions: [] };
  };

  const updateRolePermission = async (role: AppRole, permissionKey: string, granted: boolean) => {
    // Stub implementation
    return true;
  };

  const getPermissionMatrix = () => {
    // Return empty array for backward compatibility
    return [];
  };

  return {
    matrix,
    roleMatrix,
    loading,
    fetchMatrix,
    updateRolePermission,
    getPermissionMatrix
  };
};