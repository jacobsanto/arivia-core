
import React, { useState, lazy, Suspense } from "react";
import { useUser } from "@/contexts/UserContext";
import DamageReportHeader from "@/components/damage/DamageReportHeader";
import DamageReportList from "@/components/damage/DamageReportList";
import DamageReportDetail from "@/components/damage/DamageReportDetail";
import DamageReportFilters from "@/components/damage/DamageReportFilters";
import DamageReportForm from "@/components/damage/DamageReportForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDamageReports } from "@/hooks/useDamageReports";
import { DamageReportsErrorBoundary } from "@/components/error-boundaries/DamageReportsErrorBoundary";
import { Seo, JsonLd } from "@/components/seo";

const DamageReportStats = lazy(() => import("@/components/damage/stats/DamageReportStats"));

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

  return (
    <DamageReportsErrorBoundary>
      <>
        <Seo
          title="Damage Reports - Arivia Villas"
          description="Track and manage property damage reports and statistics."
          canonical="/damage-reports"
        />
        <JsonLd
          schema={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Dashboard",
                item: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Damage Reports",
                item: typeof window !== "undefined" ? `${window.location.origin}/damage-reports` : "/damage-reports",
              },
            ],
          }}
        />
        <main id="main-content" role="main" className="space-y-6">
          <header>
            <DamageReportHeader onCreateReport={() => setIsCreateReportOpen(true)} />
          </header>

          <section aria-labelledby="damage-reports-tabs">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "list" | "stats")}
              className="w-full"
            >
              <TabsList id="damage-reports-tabs" className="mb-4">
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

                <DamageReportList reports={filteredReports} onOpenReport={handleOpenReport} />
              </TabsContent>

              <TabsContent value="stats">
                <Suspense fallback={<div className="h-80 rounded-md border bg-muted/30" aria-busy>Loading charts…</div>}>
                  <DamageReportStats reports={reports} />
                </Suspense>
              </TabsContent>
            </Tabs>
          </section>

          {selectedReport && (
            <aside aria-label="Damage report details">
              <DamageReportDetail
                report={selectedReport}
                onClose={handleCloseReport}
                onUpdate={handleUpdateReport}
                onMediaUpload={handleMediaUpload}
                canEdit={
                  user?.role === "administrator" ||
                  user?.role === "property_manager" ||
                  selectedReport.assigned_to === user?.id
                }
              />
            </aside>
          )}

          <Dialog open={isCreateReportOpen} onOpenChange={setIsCreateReportOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Damage Report</DialogTitle>
              </DialogHeader>
              <DamageReportForm onSubmit={handleCreateReport} onCancel={() => setIsCreateReportOpen(false)} />
            </DialogContent>
          </Dialog>
        </main>
      </>
    </DamageReportsErrorBoundary>
  );
};

export default DamageReports;
