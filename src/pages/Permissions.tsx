import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionCard } from '@/components/permissions/PermissionCard';
import { PermissionEditorModal } from '@/components/permissions/PermissionEditorModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemPermission, PERMISSION_CATEGORIES, PERMISSION_CATEGORY_LABELS } from '@/types/permissions.types';
import { Plus, Shield, Search, Filter } from 'lucide-react';
import ErrorBoundary from '@/components/ui/error-boundary';

const Permissions: React.FC = () => {
  const {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionStats
  } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<SystemPermission | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  const stats = getPermissionStats();

  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        permission.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.permission_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;

      // Active filter
      const matchesActiveFilter = showInactive || permission.is_active;

      return matchesSearch && matchesCategory && matchesActiveFilter;
    });
  }, [permissions, searchTerm, selectedCategory, showInactive]);

  const permissionsByCategory = useMemo(() => {
    const grouped = filteredPermissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, SystemPermission[]>);

    return grouped;
  }, [filteredPermissions]);

  const handleCreatePermission = () => {
    setEditingPermission(undefined);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission: SystemPermission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPermission(undefined);
  };

  const handleDeletePermission = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      await deletePermission(id);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Error Loading Permissions</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchPermissions}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8" />
              System Permissions
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage system permissions and access control settings
            </p>
          </div>
          
          <Button onClick={handleCreatePermission} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Permission
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PERMISSION_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {PERMISSION_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={showInactive ? "default" : "outline"}
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? "Hide" : "Show"} Inactive
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              {filteredPermissions.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardHeader>
                    <CardTitle>No permissions found</CardTitle>
                    <CardDescription>
                      {searchTerm || selectedCategory !== 'all' 
                        ? "Try adjusting your filters or create a new permission."
                        : "Create your first permission to get started."
                      }
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPermissions.map(permission => (
                    <PermissionCard
                      key={permission.id}
                      permission={permission}
                      onEdit={handleEditPermission}
                      onDelete={handleDeletePermission}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {PERMISSION_CATEGORY_LABELS[category as keyof typeof PERMISSION_CATEGORY_LABELS] || category}
                    </h3>
                    <Badge variant="outline">
                      {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryPermissions.map(permission => (
                      <PermissionCard
                        key={permission.id}
                        permission={permission}
                        onEdit={handleEditPermission}
                        onDelete={handleDeletePermission}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(permissionsByCategory).length === 0 && (
                <Card className="p-8 text-center">
                  <CardHeader>
                    <CardTitle>No permissions found</CardTitle>
                    <CardDescription>
                      Try adjusting your filters or create a new permission.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Permission Editor Modal */}
        <PermissionEditorModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={createPermission}
          onUpdate={updatePermission}
          permission={editingPermission}
          isLoading={loading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Permissions;