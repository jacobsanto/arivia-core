
import React from "react";
import { ReportingContent } from "@/components/reports/ReportingContent";

const Reporting = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      <ReportingContent reportsCount={0} isLoading={false} />
    </div>
  );
};

export default Reporting;
