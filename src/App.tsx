import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";
import { TenantProvider } from "@/lib/context/TenantContext";

// Layouts
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import TenantLayout from "@/components/layout/TenantLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Auth Pages
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

// Dashboard Pages
import Dashboard from "@/pages/Dashboard";

// Role-based Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import CleanerDashboard from "@/pages/cleaner/CleanerDashboard";
import MaintenanceDashboard from "@/pages/maintenance/MaintenanceDashboard";

// Existing Pages
import UserProfile from "@/pages/UserProfile";
import Maintenance from "@/pages/Maintenance";
import Housekeeping from "@/pages/Housekeeping";
import Properties from "@/pages/Properties";
import Inventory from "@/pages/Inventory";
import TeamChat from "@/pages/TeamChat";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";
import DamageReports from "@/pages/DamageReports";
import ListingDetails from "@/pages/ListingDetails";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";
import AdminChecklists from "@/pages/AdminChecklists";

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <TenantProvider>
          <Router>
            <Routes>
              {/* Internal login route - protected by server config */}
              <Route path="/internal/login" element={<Login />} />
              
              {/* Unauthorized access page */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected tenant routes */}
              <Route element={
                <ProtectedRoute>
                  <TenantLayout />
                </ProtectedRoute>
              }>
                {/* Role-based dashboards */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/manager" element={
                  <ProtectedRoute allowedRoles={['property_manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/cleaner" element={
                  <ProtectedRoute allowedRoles={['housekeeping_staff']}>
                    <CleanerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/maintenance" element={
                  <ProtectedRoute allowedRoles={['maintenance_staff']}>
                    <MaintenanceDashboard />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Existing protected routes with unified layout */}
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
                <Route path="/properties" element={<Properties />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/team-chat" element={<TeamChat />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/damage-reports" element={<DamageReports />} />
                <Route path="/properties/listings/:listingId" element={<ListingDetails />} />
                
                {/* Admin routes */}
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/permissions" element={
                  <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                    <AdminPermissions />
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/checklists" element={
                  <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                    <AdminChecklists />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/unauthorized" replace />} />
            </Routes>
          </Router>
        </TenantProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
