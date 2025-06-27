
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import DamageReportList from "@/components/damage/DamageReportList";
import DamageReportDetail from "@/components/damage/DamageReportDetail";
import DamageReportForm from "@/components/damage/DamageReportForm";
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
    isLoading,
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

  const handleFormSubmit = async (reportData: any) => {
    // Convert form data to match DamageReport interface
    const damageReportData = {
      ...reportData,
      damage_date: typeof reportData.damage_date === 'string' ? reportData.damage_date : new Date(reportData.damage_date).toISOString(),
      reported_by: user?.id || '',
      priority: 'medium' as const,
      status: 'pending' as const
    };

    if (editingReport) {
      await updateReport(editingReport.id, damageReportData);
    } else {
      await addReport(damageReportData as Omit<DamageReport, 'id' | 'createdAt' | 'updatedAt'>);
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
