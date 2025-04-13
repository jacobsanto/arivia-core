
import React from 'react';
import { Button } from "@/components/ui/button";
import { ClipboardCheck } from "lucide-react";

interface WeeklyReviewButtonProps {
  onClick: () => void;
}

const WeeklyReviewButton: React.FC<WeeklyReviewButtonProps> = ({ onClick }) => {
  return (
    <Button 
      size="sm" 
      className="flex items-center gap-2"
      onClick={onClick}
    >
      <ClipboardCheck className="h-4 w-4" />
      <span>Weekly Review</span>
    </Button>
  );
};

export default WeeklyReviewButton;
