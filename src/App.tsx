
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OfflineIndicator from "./components/layout/OfflineIndicator";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Housekeeping from "./pages/Housekeeping";
import Maintenance from "./pages/Maintenance";
import Inventory from "./pages/Inventory";
import TeamChat from "./pages/TeamChat";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Troubleshooting from "./pages/Troubleshooting";

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
                  <Route path="housekeeping" element={<Housekeeping />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "maintenance_staff"]} />}>
                  <Route path="maintenance" element={<Maintenance />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "inventory_manager"]} />}>
                  <Route path="inventory" element={<Inventory />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager", "concierge", "housekeeping_staff", "maintenance_staff", "inventory_manager"]} />}>
                  <Route path="team-chat" element={<TeamChat />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager"]} />}>
                  <Route path="analytics" element={<Analytics />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["superadmin", "administrator", "property_manager"]} />}>
                  <Route path="reports" element={<Reports />} />
                </Route>

                {/* Troubleshooting page accessible to everyone */}
                <Route path="troubleshooting" element={<Troubleshooting />} />
                
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
          <OfflineIndicator />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
