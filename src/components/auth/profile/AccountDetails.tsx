
import React from "react";
import { User } from "@/types/auth";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { isSecureContext } from "@/utils/securityUtils";

interface AccountDetailsProps {
  user: User;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label className="text-muted-foreground text-xs mb-1 block">Account ID</Label>
        <div className="text-sm font-medium bg-secondary/50 p-2 rounded-md overflow-hidden text-ellipsis">
          {user.id}
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs mb-1 block">Secure Context</Label>
        <div className="text-sm font-medium">
          {isSecureContext() ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Check className="h-3 w-3 mr-1" /> Secure
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Insecure
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
