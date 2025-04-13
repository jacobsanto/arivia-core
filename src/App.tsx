import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import Tasks from './pages/Tasks';
import Maintenance from './pages/Maintenance';
import Inventory from './pages/Inventory';
import Reporting from './pages/Reporting';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppLayout from './components/layout/AppLayout';
import { useUser } from './contexts/UserContext';
import { Navigate } from 'react-router-dom';
import { ToastContainer } from 'sonner';
import Housekeeping from './pages/Housekeeping';
import ChecklistTemplates from "@/pages/ChecklistTemplates";

const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>; // Or a more sophisticated loading indicator
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // Redirect or show an unauthorized message if the user doesn't have the required role
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/housekeeping" element={
            <ProtectedRoute>
              <AppLayout>
                <Housekeeping />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/maintenance" element={
            <ProtectedRoute>
              <AppLayout>
                <Maintenance />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <AppLayout>
                <Inventory />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/reporting" element={
            <ProtectedRoute>
              <AppLayout>
                <Reporting />
              </AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Add the new route for checklist templates */}
          <Route path="/checklist-templates" element={
            <ProtectedRoute requiredRoles={["superadmin"]}>
              <AppLayout>
                <ChecklistTemplates />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </Router>
  );
};

export default App;
