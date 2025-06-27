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

// Dashboard Pages (existing)
import Dashboard from "@/pages/Dashboard";

// Role-based Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import CleanerDashboard from "@/pages/cleaner/CleanerDashboard";
import GuestPortal from "@/pages/guest/GuestPortal";

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
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected tenant routes */}
              <Route element={
                <ProtectedRoute>
                  <TenantLayout />
                </ProtectedRoute>
              }>
                {/* Role-based dashboards */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/cleaner" element={<CleanerDashboard />} />
                <Route path="/guest" element={<GuestPortal />} />
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
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/permissions" element={<AdminPermissions />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/checklists" element={<AdminChecklists />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </TenantProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
