
import { useState, useEffect, useCallback } from 'react';
import { DamageReport, damageService } from '@/services/damage/damage.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { toast as useToast } from '@/hooks/use-toast';

export const useDamageReports = () => {
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DamageReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();

  const loadReports = useCallback(async () => {
    const loadedReports = await damageService.getDamageReports();
    setReports(loadedReports);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    let filtered = [...reports];

    if (searchQuery) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (propertyFilter !== "all") {
      filtered = filtered.filter(report => report.property_id === propertyFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, propertyFilter, statusFilter]);

  const handleOpenReport = (report: DamageReport) => {
    setSelectedReport(report);
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
  };

  const handleCreateReport = async (data: any) => {
    const newReport = await damageService.createDamageReport({
      ...data,
      reported_by: user?.id as string,
      status: 'pending'
    });

    if (newReport) {
      if (data.media?.length) {
        for (const file of data.media) {
          await damageService.uploadMedia(
            file,
            newReport.id,
            file.type.startsWith('image/') ? 'photo' : 'video'
          );
        }
      }
      
      setIsCreateReportOpen(false);
      loadReports();
    }
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<DamageReport>) => {
    try {
      const { data, error } = await supabase
        .from('damage_reports')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Report updated successfully');
      loadReports();
      return data;
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
      return null;
    }
  };

  const handleMediaUpload = async (file: File, reportId: string) => {
    return await damageService.uploadMedia(
      file,
      reportId,
      file.type.startsWith('image/') ? 'photo' : 'video'
    );
  };

  return {
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
  };
};
