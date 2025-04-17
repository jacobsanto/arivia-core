
import React from "react";
import { securityUtils } from "@/utils/securityUtils";

const SecurityChecksSection: React.FC = () => {
  const securityChecks = [
    { name: "HTTPS", status: securityUtils.isSecureContext() },
    { name: "Cookies Enabled", status: securityUtils.areCookiesEnabled() },
    { name: "Local Storage Available", status: securityUtils.isLocalStorageAvailable() },
    { name: "Session Storage Available", status: securityUtils.isSessionStorageAvailable() },
    { name: "Modern Security Features", status: securityUtils.supportsModernSecurity() },
  ];

  return (
    <div className="rounded-md border p-4">
      <h3 className="font-medium mb-2">Security Checks</h3>
      <div className="grid gap-2">
        {securityChecks.map((check, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{check.name}</span>
            <span className={`rounded-full px-2 py-1 text-xs ${check.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {check.status ? 'Passed' : 'Failed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityChecksSection;
