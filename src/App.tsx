
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tasks from "./pages/Tasks";
import TeamChat from "./pages/TeamChat";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import LoginWithRoles from "./components/auth/LoginWithRoles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Routes requiring specific roles */}
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager"]} />}>
                  <Route path="properties" element={<Properties />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "housekeeping_staff", "maintenance_staff"]} />}>
                  <Route path="tasks" element={<Tasks />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "maintenance_staff"]} />}>
                  <Route path="maintenance" element={<Navigate to="/tasks" replace />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "inventory_manager"]} />}>
                  <Route path="inventory" element={<Navigate to="/tasks" replace />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "concierge", "housekeeping_staff", "maintenance_staff", "inventory_manager"]} />}>
                  <Route path="team-chat" element={<TeamChat />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager"]} />}>
                  <Route path="reports" element={<Navigate to="/" replace />} />
                </Route>
                
                {/* User profile accessible to everyone */}
                <Route path="profile" element={<UserProfile />} />
                
                {/* Settings route - only for admins and superadmins */}
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator"]} />}>
                  <Route path="settings" element={<Navigate to="/profile" replace />} />
                </Route>
              </Route>
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
