
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { TenantProvider } from "@/lib/context/TenantContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import TenantLayout from "@/components/layout/TenantLayout";

// Internal pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BookingManagement from "@/pages/admin/BookingManagement";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import CleanerDashboard from "@/pages/cleaner/CleanerDashboard";
import MaintenanceDashboard from "@/pages/maintenance/MaintenanceDashboard";
import TaskManagement from "@/pages/tasks/TaskManagement";
import StaffTasks from "@/pages/staff/StaffTasks";

// Error pages
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TenantProvider>
            <Router>
              <Routes>
                {/* Internal login */}
                <Route path="/internal/login" element={<Login />} />
                <Route path="/login" element={<Navigate to="/internal/login" replace />} />
                
                {/* Protected internal routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                      <TenantLayout>
                        <AdminDashboard />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin']}>
                      <TenantLayout>
                        <BookingManagement />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tasks"
                  element={
                    <ProtectedRoute allowedRoles={['superadmin', 'tenant_admin', 'property_manager']}>
                      <TenantLayout>
                        <TaskManagement />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={['property_manager', 'tenant_admin']}>
                      <TenantLayout>
                        <ManagerDashboard />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cleaner"
                  element={
                    <ProtectedRoute allowedRoles={['housekeeping_staff']}>
                      <TenantLayout>
                        <CleanerDashboard />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute allowedRoles={['maintenance_staff']}>
                      <TenantLayout>
                        <MaintenanceDashboard />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/tasks"
                  element={
                    <ProtectedRoute allowedRoles={['housekeeping_staff', 'maintenance_staff', 'concierge']}>
                      <TenantLayout>
                        <StaffTasks />
                      </TenantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Error routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/404" element={<NotFound />} />
                
                {/* Default redirects */}
                <Route path="/" element={<Navigate to="/internal/login" replace />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Router>
          </TenantProvider>
        </UserProvider>
      </AuthProvider>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
