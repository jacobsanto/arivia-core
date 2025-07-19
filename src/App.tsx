
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";
import { MVPErrorBoundary } from "@/components/mvp/ErrorBoundary";

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
import DamageReports from "@/pages/DamageReports";
import ListingDetails from "@/pages/ListingDetails";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";
import AdminChecklists from "@/pages/AdminChecklists";

function App() {
  return (
    <MVPErrorBoundary>
      <HelmetProvider>
        <ToastProvider>
          <Router>
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
                <Route path="/properties" element={<Properties />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/team-chat" element={<TeamChat />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/damage-reports" element={<DamageReports />} />
                
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
          </Router>
        </ToastProvider>
      </HelmetProvider>
    </MVPErrorBoundary>
  );
}

export default App;
