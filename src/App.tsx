
import React, { Suspense, lazy, useEffect } from "react";
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

// Pages (lazy-loaded)
import Login from "@/pages/Login";
import TeamChat from "@/pages/TeamChat";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Housekeeping = lazy(() => import("@/pages/Housekeeping"));
const Properties = lazy(() => import("@/pages/Properties"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Reports = lazy(() => import("@/pages/Reports"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const DamageReports = lazy(() => import("@/pages/DamageReports"));
const CleaningSettings = lazy(() => import("@/pages/CleaningSettings"));
const ListingDetails = lazy(() => import("@/pages/ListingDetails"));
const SystemAdminPage = lazy(() => import("@/pages/SystemAdminPage"));
const OptimizationPage = lazy(() => import("@/pages/OptimizationPage"));

// Admin Pages (lazy-loaded)
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminPermissions = lazy(() => import("@/pages/AdminPermissions"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const AdminChecklists = lazy(() => import("@/pages/AdminChecklists"));
const EnhancedTasks = lazy(() => import("@/pages/EnhancedTasks"));

function App() {
  // Prefetch high-traffic routes to avoid visible loading on navigation
  useEffect(() => {
    void Promise.all([
      import("@/pages/Dashboard"),
      import("@/pages/Properties"),
      import("@/pages/Inventory"),
      import("@/pages/TeamChat"),
    ]);
  }, []);

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
                  <Suspense fallback={null}>
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
                  </Suspense>
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
