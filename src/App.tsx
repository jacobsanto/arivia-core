import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "next-themes";

import { MVPErrorBoundary } from "@/components/mvp/ErrorBoundary";
import { AccessibilityProvider } from "@/components/accessibility/AccessibilityProvider";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { FullPageLoading } from "@/components/common/loading/LoadingStates";

// Unified Layout
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Critical pages loaded immediately
import Dashboard from "@/pages/Dashboard";
import { MVPLoginPage } from "@/components/auth/mvp/MVPLoginPage";

// Lazy-loaded pages for code splitting
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Maintenance = lazy(() => import("@/pages/Maintenance"));
const Housekeeping = lazy(() => import("@/pages/Housekeeping"));
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetailPage = lazy(() => import("./components/properties/enhanced/PropertyDetailView").then(m => ({ default: m.PropertyDetailView })));
const Inventory = lazy(() => import("@/pages/Inventory"));
const TeamChat = lazy(() => import("@/pages/TeamChat"));
const CleaningSettings = lazy(() => import("@/pages/CleaningSettings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Reports = lazy(() => import("@/pages/Reports"));
const RecurringTasks = lazy(() => import("@/pages/RecurringTasks"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const DamageReports = lazy(() => import("@/pages/DamageReports"));
const ListingDetails = lazy(() => import("@/pages/ListingDetails"));
const SystemAdminPage = lazy(() => import("@/pages/SystemAdminPage"));
const OptimizationPage = lazy(() => import("@/pages/OptimizationPage"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminPermissions = lazy(() => import("@/pages/AdminPermissions"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const EnhancedTasks = lazy(() => import("@/pages/EnhancedTasks"));
const Checklists = lazy(() => import("@/pages/Checklists"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Permissions = lazy(() => import("@/pages/Permissions"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const SystemSettings = lazy(() => import("@/pages/SystemSettings"));


function App() {
  console.log('[App] Rendering App component');
  return (
    <MVPErrorBoundary>
      <HelmetProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            <ToastProvider>
                <Router>
                  <SkipLink href="#main-content">Skip to main content</SkipLink>
                
                <Routes>
                  {/* Public Auth Routes */}
                  <Route path="/login" element={<MVPLoginPage />} />
                  <Route path="/register" element={<MVPLoginPage />} />
                  
                  {/* Protected routes with UnifiedLayout */}
                  <Route element={
                    <ProtectedRoute>
                      <UnifiedLayout />
                    </ProtectedRoute>
                  }>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Suspense fallback={<FullPageLoading />}><UserProfile /></Suspense>} />
                    <Route path="/housekeeping" element={<Suspense fallback={<FullPageLoading />}><Housekeeping /></Suspense>} />
                    <Route path="/maintenance" element={<Suspense fallback={<FullPageLoading />}><Maintenance /></Suspense>} />
                    <Route path="/tasks/enhanced" element={<Suspense fallback={<FullPageLoading />}><EnhancedTasks /></Suspense>} />
                    <Route path="/properties" element={<Suspense fallback={<FullPageLoading />}><Properties /></Suspense>} />
                    <Route path="/properties/:propertyId" element={<Suspense fallback={<FullPageLoading />}><PropertyDetailPage /></Suspense>} />
                    <Route path="/inventory" element={<Suspense fallback={<FullPageLoading />}><Inventory /></Suspense>} />
                    <Route path="/team-chat" element={<Suspense fallback={<FullPageLoading />}><TeamChat /></Suspense>} />
                    <Route path="/cleaning-settings" element={<Suspense fallback={<FullPageLoading />}><CleaningSettings /></Suspense>} />
                    <Route path="/recurring-tasks" element={<Suspense fallback={<FullPageLoading />}><RecurringTasks /></Suspense>} />
                    <Route path="/analytics" element={<Suspense fallback={<FullPageLoading />}><Analytics /></Suspense>} />
                    <Route path="/reports" element={<Suspense fallback={<FullPageLoading />}><Reports /></Suspense>} />
                    <Route path="/notifications" element={<Suspense fallback={<FullPageLoading />}><Notifications /></Suspense>} />
                    <Route path="/permissions" element={<Suspense fallback={<FullPageLoading />}><Permissions /></Suspense>} />
                    <Route path="/damage-reports" element={<Suspense fallback={<FullPageLoading />}><DamageReports /></Suspense>} />
                    <Route path="/system-admin" element={<Suspense fallback={<FullPageLoading />}><SystemAdminPage /></Suspense>} />
                    <Route path="/optimization" element={<Suspense fallback={<FullPageLoading />}><OptimizationPage /></Suspense>} />
                    <Route path="/system-health" element={<Suspense fallback={<FullPageLoading />}><SystemHealth /></Suspense>} />
                    <Route path="/properties/listings/:listingId" element={<Suspense fallback={<FullPageLoading />}><ListingDetails /></Suspense>} />
                    <Route path="/admin/users" element={<Suspense fallback={<FullPageLoading />}><AdminUsers /></Suspense>} />
                    <Route path="/admin/permissions" element={<Suspense fallback={<FullPageLoading />}><AdminPermissions /></Suspense>} />
                    <Route path="/admin/settings" element={<Suspense fallback={<FullPageLoading />}><AdminSettings /></Suspense>} />
                    <Route path="/checklists" element={<Suspense fallback={<FullPageLoading />}><Checklists /></Suspense>} />
                    <Route path="/user-management" element={<Suspense fallback={<FullPageLoading />}><UserManagement /></Suspense>} />
                    <Route path="/system-settings" element={<Suspense fallback={<FullPageLoading />}><SystemSettings /></Suspense>} />
                  </Route>
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                </Router>
            </ToastProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </HelmetProvider>
    </MVPErrorBoundary>
  );
}

export default App;
