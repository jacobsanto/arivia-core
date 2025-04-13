
import React from "react";
import SystemSettingsTabs from "@/components/settings/SystemSettingsTabs";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <SystemSettingsTabs />
    </div>
  );
};

export default Settings;
