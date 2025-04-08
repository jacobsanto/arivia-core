
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import GoogleDriveIntegration from "./pages/GoogleDriveIntegration";

import AppLayout from "./components/layout/AppLayout";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={
              <div className="container py-16 flex items-center justify-center">
                <Login />
              </div>
            } />
            <Route path="/register" element={
              <div className="container py-16 flex items-center justify-center">
                <Login isRegister={true} />
              </div>
            } />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/google-sheets" element={<GoogleSheetsIntegration />} />
                <Route path="/drive-integration" element={<GoogleDriveIntegration />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
