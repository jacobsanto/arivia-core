
import React from "react";
import { Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface OriginIconProps {
  origin: string;
  className?: string;
}

export const OriginIcon: React.FC<OriginIconProps> = ({ origin, className = "" }) => {
  return origin === "webhook" 
    ? <Zap className={cn("text-yellow-500", className)} size={16} />
    : <Package className={cn("text-blue-500", className)} size={16} />;
};
