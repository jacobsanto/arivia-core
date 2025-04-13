
import React from "react";

interface RevenueBreakdownProps {
  totalRevenue: number;
}

export const RevenueBreakdown: React.FC<RevenueBreakdownProps> = ({ totalRevenue }) => {
  const accommodationRevenue = Math.round(totalRevenue * 0.85);
  const servicesRevenue = Math.round(totalRevenue * 0.12);
  const otherRevenue = Math.round(totalRevenue * 0.03);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <span className="font-medium">Total Revenue</span>
        <span className="text-xl">€{totalRevenue}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Accommodation</span>
        <span>€{accommodationRevenue}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Additional Services</span>
        <span>€{servicesRevenue}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Other</span>
        <span>€{otherRevenue}</span>
      </div>
    </div>
  );
};
