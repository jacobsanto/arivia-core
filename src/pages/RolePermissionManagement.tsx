
import React from 'react';
import { Helmet } from 'react-helmet-async';
import RolePermissionManagement from '@/components/admin/permissions';

const RolePermissionManagementPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Role & Permission Management - Arivia Villa Sync</title>
        <meta name="description" content="Manage system roles, permissions, and user assignments" />
      </Helmet>
      <RolePermissionManagement />
    </>
  );
};

export default RolePermissionManagementPage;
