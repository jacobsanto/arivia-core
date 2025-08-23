import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CleaningSettings as CleaningSettingsComponent } from '@/components/cleaning/CleaningSettings';

const CleaningSettings: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Cleaning Settings - Arivia Villas Management</title>
        <meta name="description" content="Configure cleaning rules, actions, and automation for your properties" />
      </Helmet>
      <CleaningSettingsComponent />
    </>
  );
};

export default CleaningSettings;