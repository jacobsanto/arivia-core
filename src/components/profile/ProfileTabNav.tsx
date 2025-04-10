
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProfileTabNavProps {
  currentTabIndex: number;
  hasPrevTab: boolean;
  hasNextTab: boolean;
  onPrevTab: () => void;
  onNextTab: () => void;
}

const ProfileTabNav: React.FC<ProfileTabNavProps> = ({
  hasPrevTab,
  hasNextTab,
  onPrevTab,
  onNextTab
}) => {
  return (
    <div className="flex justify-between mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevTab}
        disabled={!hasPrevTab}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextTab}
        disabled={!hasNextTab}
        className="flex items-center gap-1"
      >
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProfileTabNav;
