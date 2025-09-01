import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Level Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Assign default checklists to each service type to ensure consistent standards across all cleaning tasks.
          </p>
          
          <div className="space-y-4">
            {Object.entries(SERVICE_TYPE_LABELS).map(([serviceType, label]) => (
              <div key={serviceType} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>{label}</Label>
                  <p className="text-sm text-muted-foreground">
                    Default checklist for {label.toLowerCase()} tasks
                  </p>
                </div>
                
                <div className="w-64">
                  <Select
                    value={serviceLevelConfig[serviceType as ServiceType] || ''}
                    onValueChange={(value) => onUpdate(
                      serviceType as ServiceType, 
                      value || null
                    )}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No default checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No default checklist</SelectItem>
                      {checklistTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};