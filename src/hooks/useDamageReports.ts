
import { useState, useEffect } from "react";
import { DamageReport, DamageReportFilters } from "@/types/damage";

// Mock data for now - replace with actual API calls
const mockReports: DamageReport[] = [
  {
    id: "1",
    title: "Broken Window",
    description: "Guest accidentally broke living room window",
    status: "pending",
    priority: "high",
    propertyId: "prop-1",
    reportedBy: "manager-1",
    damageDate: new Date("2024-01-15"),
    estimatedCost: 150,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Stained Carpet",
    description: "Red wine stain on bedroom carpet",
    status: "investigating",
    priority: "medium",
    propertyId: "prop-2",
    reportedBy: "cleaner-1",
    assignedTo: "manager-1",
    damageDate: new Date("2024-01-14"),
    estimatedCost: 200,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-16"),
  },
];

export const useDamageReports = () => {
  const [reports, setReports] = useState<DamageReport[]>(mockReports);
  const [filters, setFilters] = useState<DamageReportFilters>({});
  const [isLoading, setIsLoading] = useState(false);

  // Apply filters to reports
  const filteredReports = reports.filter(report => {
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
        ? { ...report, status, updatedAt: new Date() }
        : report
    ));
  };

  const addReport = async (reportData: Omit<DamageReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReport: DamageReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setReports(prev => [newReport, ...prev]);
  };

  const updateReport = async (reportId: string, updates: Partial<DamageReport>) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, ...updates, updatedAt: new Date() }
        : report
    ));
  };

  const deleteReport = async (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  };

  return {
    reports,
    filteredReports,
    filters,
    isLoading,
    updateFilters,
    updateReportStatus,
    addReport,
    updateReport,
    deleteReport,
  };
};
