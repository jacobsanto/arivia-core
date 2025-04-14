
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";

// Unified Layout
import UnifiedLayout from "@/components/layout/UnifiedLayout";

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
import AuthRedirect from "@/pages/AuthRedirect";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";
import AdminChecklists from "@/pages/AdminChecklists";

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* All routes use the single unified layout */}
            <Route element={<UnifiedLayout />}>
              {/* Public route */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
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
              
              {/* Admin routes */}
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/permissions" element={<AdminPermissions />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/checklists" element={<AdminChecklists />} />
            </Route>
            
            {/* Auth redirect handler - outside of layout */}
            <Route path="/auth-redirect" element={<AuthRedirect />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
