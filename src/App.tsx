
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";
import { DevModeProvider } from "@/contexts/DevModeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MVPErrorBoundary } from "@/components/mvp/ErrorBoundary";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { DevModePanel } from "@/components/dev/DevModePanel";
import { DevModeStatusBar } from "@/components/dev/DevModeStatusBar";

// Unified Layout
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import UserProfile from "@/pages/UserProfile";
import Maintenance from "@/pages/Maintenance";
import Housekeeping from "@/pages/Housekeeping";
import Properties from "@/pages/Properties";
import Inventory from "@/pages/Inventory";
import TeamChat from "@/pages/TeamChat";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import SystemHealth from "@/pages/SystemHealth";

import DamageReports from "@/pages/DamageReports";
import CleaningSettings from "@/pages/CleaningSettings";
import ListingDetails from "@/pages/ListingDetails";
import VirtualTourPage from "@/pages/VirtualTourPage";
import SystemAdminPage from "@/pages/SystemAdminPage";
import OptimizationPage from "@/pages/OptimizationPage";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";
import AdminChecklists from "@/pages/AdminChecklists";
import EnhancedTasks from "@/pages/EnhancedTasks";

function App() {
  return (
    <MVPErrorBoundary>
      <HelmetProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <DevModeProvider>
              <AuthProvider>
                <Router>
                  <SkipLink href="#main-content">Skip to main content</SkipLink>
                <DevModeStatusBar />
                <Routes>
                  {/* Login route - doesn't use the unified layout */}
                  <Route path="/login" element={<Login />} />
                  
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
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/team-chat" element={<TeamChat />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/reports" element={<Reports />} />
                     
                     <Route path="/cleaning-settings" element={<CleaningSettings />} />
                     <Route path="/damage-reports" element={<DamageReports />} />
                    <Route path="/virtual-tours" element={<VirtualTourPage />} />
                    <Route path="/system-admin" element={<SystemAdminPage />} />
                     <Route path="/optimization" element={<OptimizationPage />} />
                     <Route path="/system-health" element={<SystemHealth />} />
                    
                    {/* Property details route */}
                    <Route path="/properties/listings/:listingId" element={<ListingDetails />} />
                    
                    {/* Admin routes */}
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/permissions" element={<AdminPermissions />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/checklists" element={<AdminChecklists />} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                <DevModePanel />
                </Router>
              </AuthProvider>
            </DevModeProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </HelmetProvider>
    </MVPErrorBoundary>
  );
}

export default App;
