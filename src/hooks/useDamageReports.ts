
import { useState, useEffect } from "react";
import { DamageReport, DamageReportFilters } from "@/types/damage";
import { damageService } from "@/services/damage/damage.service";

export const useDamageReports = () => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [filters, setFilters] = useState<DamageReportFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await damageService.getDamageReports();
      // Convert the service format to local format
      const convertedReports: DamageReport[] = data.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        status: report.status,
        priority: 'medium', // Default priority since it's not in service
        propertyId: report.property_id,
        property_id: report.property_id,
        reportedBy: report.reported_by,
        reported_by: report.reported_by,
        assignedTo: report.assigned_to,
        assigned_to: report.assigned_to,
        damageDate: report.damage_date,
        damage_date: report.damage_date,
        estimatedCost: report.estimated_cost,
        estimated_cost: report.estimated_cost,
        finalCost: report.final_cost,
        final_cost: report.final_cost,
        photos: [],
        createdAt: report.created_at,
        created_at: report.created_at,
        updatedAt: report.updated_at,
        updated_at: report.updated_at,
        resolutionDate: report.resolution_date,
        resolution_date: report.resolution_date,
        conclusion: report.conclusion,
        compensationAmount: report.compensation_amount,
        compensation_amount: report.compensation_amount,
        compensationNotes: report.compensation_notes,
        compensation_notes: report.compensation_notes,
      }));
      setReports(convertedReports);
    } catch (error) {
      console.error('Error loading damage reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === "" || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filters.status?.length && !filters.status.includes(report.status)) {
      return false;
    }
    if (filters.priority?.length && !filters.priority.includes(report.priority)) {
      return false;
    }
    if (filters.propertyId && report.propertyId !== filters.propertyId) {
      return false;
    }
    if (filters.assignedTo && report.assignedTo !== filters.assignedTo) {
      return false;
    }
    return true;
  });

  const updateFilters = (newFilters: Partial<DamageReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateReportStatus = async (reportId: string, status: DamageReport['status']) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status, updatedAt: new Date().toISOString() }
        : report
    ));
  };

  const addReport = async (reportData: Omit<DamageReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: DamageReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
  };

  const updateReport = async (reportId: string, updates: Partial<DamageReport>) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, ...updates, updatedAt: new Date().toISOString() }
        : report
    ));
  };

  const deleteReport = async (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  };

  const handleMediaUpload = async (file: File, reportId: string) => {
    try {
      const url = await damageService.uploadMedia(file, reportId, 'photo');
      if (url) {
        updateReport(reportId, { 
          photos: [...(reports.find(r => r.id === reportId)?.photos || []), url] 
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  return {
    reports,
    filteredReports,
    filters,
    isLoading,
    searchQuery,
    setSearchQuery,
    updateFilters,
    updateReportStatus,
    addReport,
    updateReport,
    deleteReport,
    handleMediaUpload,
    refreshReports: loadReports
  };
};
