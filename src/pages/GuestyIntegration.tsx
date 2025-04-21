
import React from 'react';

// Show a decommissioned integration page
export default function GuestyIntegration() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-destructive mb-6">Guesty Integration Decommissioned</h1>
        <p className="text-muted-foreground mb-8">
          The Guesty and Netlify integrations have been removed from the platform. Please contact your administrator for details.
        </p>
      </div>
    </div>
  );
}
