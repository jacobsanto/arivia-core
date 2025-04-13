import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

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

// New Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";

function App() {
  return (
    <>
      <HelmetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        <Toaster richColors position="top-right" />
      </HelmetProvider>
    </>
  );
}

export default App;
