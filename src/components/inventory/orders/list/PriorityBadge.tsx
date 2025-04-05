
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: string;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case "low":
      return <Badge variant="outline" className="bg-gray-100">Low</Badge>;
    case "medium":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Medium</Badge>;
    case "high":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">High</Badge>;
    case "urgent":
      return <Badge variant="outline" className="bg-red-100 text-red-800">URGENT</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default PriorityBadge;
