/**
 * Admin Settings Content component - responsive content wrapper
 */
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResponsiveContainer } from '@/components/ui/mobile/mobile-responsive';
import SystemSettingsTabs from '@/components/settings/SystemSettingsTabs';

export const AdminSettingsContent: React.FC = () => {
  return (
    <ResponsiveContainer
      className="min-w-0 max-w-[100vw] overflow-x-hidden"
      mobileClassName="px-0"
      desktopClassName="px-2"
    >
      <ScrollArea className="h-full">
        <div className="pb-6">
          <SystemSettingsTabs />
        </div>
      </ScrollArea>
    </ResponsiveContainer>
  );
};