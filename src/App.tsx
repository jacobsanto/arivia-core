
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "@/contexts/ToastContext";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import UserProfile from "@/pages/UserProfile";
import Maintenance from "@/pages/Maintenance";
import Housekeeping from "@/pages/Housekeeping";
import Properties from "@/pages/Properties";
import Inventory from "@/pages/Inventory";
import TeamChat from "@/pages/TeamChat";
import Analytics from "@/pages/Analytics";
import Reports from "@/pages/Reports";

// Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Redirect root to dashboard for consistent navigation */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="housekeeping" element={<Housekeeping />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="properties" element={<Properties />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="team-chat" element={<TeamChat />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              
              {/* Admin routes */}
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/permissions" element={<AdminPermissions />} />
              <Route path="admin/settings" element={<AdminSettings />} />
              
              {/* Redirect unknown paths to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
