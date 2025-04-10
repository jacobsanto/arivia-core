
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";

// Layouts
import MainLayout from "@/components/layout/MainLayout";

// Pages
import Dashboard from "@/pages/Dashboard";
import UserProfile from "@/pages/UserProfile";
import HousekeepingTasks from "@/pages/HousekeepingTasks";
import MaintenanceTasks from "@/pages/MaintenanceTasks";

// New Admin Pages
import AdminUsers from "@/pages/AdminUsers";
import AdminPermissions from "@/pages/AdminPermissions";
import AdminSettings from "@/pages/AdminSettings";

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="housekeeping" element={<HousekeepingTasks />} />
            <Route path="maintenance" element={<MaintenanceTasks />} />
            
            {/* Admin routes */}
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/permissions" element={<AdminPermissions />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            
            {/* Redirect unknown paths to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
      <Toaster richColors />
    </HelmetProvider>
  );
};

export default App;
