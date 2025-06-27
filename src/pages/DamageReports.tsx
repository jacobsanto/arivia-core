import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import DamageReportHeader from "@/components/damage/DamageReportHeader";
import DamageReportList from "@/components/damage/DamageReportList";
import DamageReportDetail from "@/components/damage/DamageReportDetail";
import DamageReportFilters from "@/components/damage/DamageReportFilters";
import DamageReportStats from "@/components/damage/stats/DamageReportStats";
import DamageReportForm from "@/components/damage/DamageReportForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDamageReports } from "@/hooks/useDamageReports";

const DamageReports = () => {
  const {
    reports,
    filteredReports,
    searchQuery,
    setSearchQuery,
    selectedReport,
    isCreateReportOpen,
    setIsCreateReportOpen,
    propertyFilter,
    setPropertyFilter,
    statusFilter,
    setStatusFilter,
    handleOpenReport,
    handleCloseReport,
    handleCreateReport,
    handleUpdateReport,
    handleMediaUpload,
  } = useDamageReports();

  const [viewMode, setViewMode] = useState<"list" | "stats">("list");
  const { user } = useUser();

  const canCreateReport = user?.role === "superadmin" || 
                         user?.role === "tenant_admin" || 
                         user?.role === "property_manager";

  return (
    <div className="space-y-6">
      <DamageReportHeader 
        onCreateReport={() => setIsCreateReportOpen(true)}
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "stats")} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Report List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <DamageReportFilters 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            propertyFilter={propertyFilter}
            onPropertyFilter={setPropertyFilter}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
          />

          <DamageReportList
            reports={filteredReports}
            onOpenReport={handleOpenReport}
          />
        </TabsContent>

        <TabsContent value="stats">
          <DamageReportStats reports={reports} />
        </TabsContent>
      </Tabs>

      {selectedReport && (
        <DamageReportDetail
          report={selectedReport}
          onClose={handleCloseReport}
          onUpdate={handleUpdateReport}
          onMediaUpload={handleMediaUpload}
          canEdit={user?.role === "administrator" || user?.role === "property_manager" || selectedReport.assigned_to === user?.id}
        />
      )}

      <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Damage Report</DialogTitle>
          </DialogHeader>
          <DamageReportForm 
            onSubmit={handleCreateReport}
            onCancel={() => setIsCreateReportOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DamageReports;
