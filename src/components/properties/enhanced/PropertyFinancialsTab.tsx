import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedProperty } from "@/types/property-detailed.types";

interface PropertyFinancialsTabProps {
  property: DetailedProperty;
}

export const PropertyFinancialsTab: React.FC<PropertyFinancialsTabProps> = ({ property }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${property.financial_summary.total_costs.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Maintenance</span>
              <span>${property.financial_summary.maintenance_costs.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Damages</span>
              <span>${property.financial_summary.damage_costs.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};