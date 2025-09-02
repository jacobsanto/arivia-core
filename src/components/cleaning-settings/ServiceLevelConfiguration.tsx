import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType, ServiceLevelConfig, ChecklistTemplate, SERVICE_TYPE_LABELS } from '@/types/cleaningSettings.types';

interface ServiceLevelConfigurationProps {
  serviceLevelConfig: ServiceLevelConfig;
  checklistTemplates: ChecklistTemplate[];
  onUpdate: (serviceType: ServiceType, checklistId: string | null) => void;
  loading: boolean;
}

export const ServiceLevelConfiguration: React.FC<ServiceLevelConfigurationProps> = ({
  serviceLevelConfig,
  checklistTemplates,
  onUpdate,
  loading
}) => {
  const housekeepingTemplates = checklistTemplates.filter(t => t.type === 'housekeeping');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Level Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(SERVICE_TYPE_LABELS).map(([serviceType, label]) => (
          <div key={serviceType} className="space-y-2">
            <Label>{label}</Label>
            <Select
              value={serviceLevelConfig[serviceType as ServiceType] || ""}
              onValueChange={(value) => onUpdate(serviceType as ServiceType, value || null)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select checklist template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No template</SelectItem>
                {housekeepingTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};