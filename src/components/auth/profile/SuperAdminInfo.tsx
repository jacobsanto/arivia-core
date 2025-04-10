
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

const SuperAdminInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-blue-500" />
        <h3 className="font-medium text-blue-700">SuperAdmin Access</h3>
      </div>
      <p className="text-sm text-blue-600 mb-2">
        You have elevated privileges to manage all aspects of the system.
      </p>
      <div className="flex flex-wrap gap-1">
        <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
          System Settings
        </Badge>
        <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
          User Management
        </Badge>
        <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
          Role Configuration
        </Badge>
        <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300">
          Permission Control
        </Badge>
      </div>
    </div>
  );
};

export default SuperAdminInfo;
