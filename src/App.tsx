import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "sonner";

import { AuthProvider } from "./contexts/auth/AuthContext";
import { ProtectedRoute } from "./contexts/auth/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Bookings from "./pages/Bookings";
import Guests from "./pages/Guests";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Inventory from "./pages/Inventory";
import GoogleSheetsIntegration from "./pages/GoogleSheetsIntegration";

import AppLayout from "./components/layout/AppLayout";
import { Table } from "lucide-react";
import { PackageSearch } from "lucide-react";
import { Home } from "lucide-react";

// Import the new GoogleDriveProvider and GoogleDriveIntegration page
import { GoogleDriveProvider } from "./contexts/GoogleDriveContext";
import GoogleDriveIntegration from "./pages/GoogleDriveIntegration";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        <GoogleDriveProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Properties />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/properties/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PropertyDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Bookings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guests"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Guests />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Tasks />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Inventory />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/google-sheets"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GoogleSheetsIntegration />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Add the new GoogleDriveIntegration route */}
              <Route
                path="/drive-integration"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <GoogleDriveIntegration />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login"
                element={
                  <div className="container py-16 flex items-center justify-center">
                    <Login />
                  </div>
                }
              />
              <Route
                path="/register"
                element={
                  <div className="container py-16 flex items-center justify-center">
                    <Login isRegister={true} />
                  </div>
                }
              />
            </Routes>
          </Router>
        </GoogleDriveProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
