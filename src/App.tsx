
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";


import { MVPErrorBoundary } from "@/components/mvp/ErrorBoundary";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { SkipLink } from "@/components/accessibility/SkipLink";

// Unified Layout
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Dashboard from "@/pages/Dashboard";
// Login page removed - app is now open access
import UserProfile from "@/pages/UserProfile";
import Maintenance from "@/pages/Maintenance";
import Housekeeping from "@/pages/Housekeeping";
import Properties from "@/pages/Properties";
import { PropertyDetailView as PropertyDetailPage } from "./components/properties/enhanced/PropertyDetailView";
import Inventory from "@/pages/Inventory";
import TeamChat from "@/pages/TeamChat";
import CleaningSettings from "@/pages/CleaningSettings";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import RecurringTasks from "@/pages/RecurringTasks";
import SystemHealth from "@/pages/SystemHealth";

import DamageReports from "@/pages/DamageReports";
import ListingDetails from "@/pages/ListingDetails";

import SystemAdminPage from "@/pages/SystemAdminPage";
import OptimizationPage from "@/pages/OptimizationPage";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";
// AdminChecklists removed - using new Checklists page instead
import EnhancedTasks from "@/pages/EnhancedTasks";
import Checklists from "@/pages/Checklists";
import Permissions from "@/pages/Permissions";
import UserManagement from "@/pages/UserManagement";

function App() {
  return (
    <MVPErrorBoundary>
      <HelmetProvider>
        <AccessibilityProvider>
          <ToastProvider>
                <Router>
                  <SkipLink href="#main-content">Skip to main content</SkipLink>
                
                <Routes>
                   {/* Login route removed - app is now open access */}
                  
                  {/* Protected routes with UnifiedLayout */}
                  <Route element={
                    <ProtectedRoute>
                      <UnifiedLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/housekeeping" element={<Housekeeping />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/tasks/enhanced" element={<EnhancedTasks />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:propertyId" element={<PropertyDetailPage />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/team-chat" element={<TeamChat />} />
                    <Route path="/cleaning-settings" element={<CleaningSettings />} />
                    <Route path="/recurring-tasks" element={<RecurringTasks />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                     
                     
                     <Route path="/damage-reports" element={<DamageReports />} />
                    
                    <Route path="/system-admin" element={<SystemAdminPage />} />
                     <Route path="/optimization" element={<OptimizationPage />} />
                     <Route path="/system-health" element={<SystemHealth />} />
                    
                    {/* Property details route */}
                    <Route path="/properties/listings/:listingId" element={<ListingDetails />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/permissions" element={<AdminPermissions />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/checklists" element={<Checklists />} />
                    <Route path="/permissions" element={<Permissions />} />
                    <Route path="/user-management" element={<UserManagement />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                </Router>
          </ToastProvider>
        </AccessibilityProvider>
      </HelmetProvider>
    </MVPErrorBoundary>
  );
}

export default App;
