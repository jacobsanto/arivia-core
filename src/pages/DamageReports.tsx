
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import DamageReportList from "@/components/damage/DamageReportList";
import DamageReportDetail from "@/components/damage/DamageReportDetail";
import DamageReportForm from "@/components/damage/DamageReportForm";
import DamageReportFilters from "@/components/damage/DamageReportFilters";
import DamageReportStats from "@/components/damage/stats/DamageReportStats";
import { useDamageReports } from "@/hooks/useDamageReports";
import type { DamageReport } from "@/types/damage";

const DamageReports: React.FC = () => {
  const { user } = useUser();
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DamageReport | null>(null);
  
  const {
    reports,
    filteredReports,
    filters,
    isLoading,
    updateFilters,
    updateReportStatus,
    addReport,
    updateReport,
    deleteReport
  } = useDamageReports();

  // Check if user can manage damage reports (tenant_admin or property_manager)
  const canManage = user?.role === "tenant_admin" || user?.role === "property_manager";

  const handleCreateReport = () => {
    setEditingReport(null);
    setIsFormOpen(true);
  };

  const handleEditReport = (report: DamageReport) => {
    setEditingReport(report);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (reportData: Partial<DamageReport>) => {
    if (editingReport) {
      await updateReport(editingReport.id, reportData);
    } else {
      await addReport(reportData as Omit<DamageReport, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsFormOpen(false);
    setEditingReport(null);
  };

  const handleStatusChange = async (reportId: string, status: DamageReport['status']) => {
    await updateReportStatus(reportId, status);
    // Update selected report if it's the one being changed
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, status });
    }
  };

  if (selectedReport) {
    return (
      <div className="container mx-auto p-6">
        <DamageReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
        />
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <div className="container mx-auto p-6">
        <DamageReportForm
          report={editingReport}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingReport(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Damage Reports</h1>
          <p className="text-muted-foreground">
            Track and manage property damage incidents
          </p>
        </div>
        
        <Button onClick={handleCreateReport} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <DamageReportStats reports={reports} />
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <DamageReportFilters
            filters={filters}
            onFiltersChange={updateFilters}
          />
        </CardContent>
      </Card>

      <DamageReportList
        reports={filteredReports}
        isLoading={isLoading}
        onSelectReport={setSelectedReport}
        onEditReport={canManage ? handleEditReport : undefined}
        onDeleteReport={canManage ? deleteReport : undefined}
        onStatusChange={canManage ? handleStatusChange : undefined}
      />
    </div>
  );
};

export default DamageReports;
