import React, { useState } from 'react';
import { GeneralSettings } from '@/components/cleaning-settings/GeneralSettings';
import { RulesList } from '@/components/cleaning-settings/RulesList';
import { ServiceLevelConfiguration } from '@/components/cleaning-settings/ServiceLevelConfiguration';
import { RuleEditorModal } from '@/components/cleaning-settings/RuleEditorModal';
import { useCleaningSettings } from '@/hooks/useCleaningSettings';
import { CleaningRule } from '@/types/cleaningSettings.types';

const CleaningSettings: React.FC = () => {
  const {
    settings,
    loading,
    updateGeneralSettings,
    addRule,
    updateRule,
    deleteRule,
    updateServiceLevelConfig,
    getChecklistTemplates,
    getRuleDescription
  } = useCleaningSettings();

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CleaningRule | undefined>();

  const handleAddRule = () => {
    setEditingRule(undefined);
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (rule: CleaningRule) => {
    setEditingRule(rule);
    setIsRuleModalOpen(true);
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    await updateRule(ruleId, { isActive });
  };

  const handleCloseModal = () => {
    setIsRuleModalOpen(false);
    setEditingRule(undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Cleaning Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure automation rules and standardize cleaning operations across all properties
        </p>
      </div>

      {/* General Settings */}
      <GeneralSettings
        settings={{
          isAutomatedSchedulingEnabled: settings.isAutomatedSchedulingEnabled,
          defaultCleaningTime: settings.defaultCleaningTime
        }}
        onUpdate={updateGeneralSettings}
        loading={loading}
      />

      {/* Rules Management */}
      <RulesList
        rules={settings.rules}
        onAddRule={handleAddRule}
        onEditRule={handleEditRule}
        onDeleteRule={deleteRule}
        onToggleRule={handleToggleRule}
        getRuleDescription={getRuleDescription}
        loading={loading}
      />

      {/* Service Level Configuration */}
      <ServiceLevelConfiguration
        serviceLevelConfig={settings.serviceLevelConfig}
        checklistTemplates={getChecklistTemplates()}
        onUpdate={updateServiceLevelConfig}
        loading={loading}
      />

      {/* Rule Editor Modal */}
      <RuleEditorModal
        isOpen={isRuleModalOpen}
        onClose={handleCloseModal}
        onSave={addRule}
        onUpdate={updateRule}
        rule={editingRule}
        isLoading={loading}
      />
    </div>
  );
};

export default CleaningSettings;