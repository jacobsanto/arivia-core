
import React from "react";
import { MVPPropertiesPage } from "@/components/properties/mvp/MVPPropertiesPage";
import { PropertiesErrorBoundary } from "@/components/error-boundaries/PropertiesErrorBoundary";

const Properties: React.FC = () => {
  return (
    <PropertiesErrorBoundary>
      <MVPPropertiesPage />
    </PropertiesErrorBoundary>
  );
};

export default Properties;
