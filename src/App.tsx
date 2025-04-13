
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import AppLayout from './components/layout/AppLayout';

// Lazy load pages to improve performance
const Home = React.lazy(() => import('./pages/Home'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Housekeeping = React.lazy(() => import('./pages/Housekeeping'));
const Maintenance = React.lazy(() => import('./pages/Maintenance'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Reports = React.lazy(() => import('./pages/Reporting')); 
const Analytics = React.lazy(() => import('./pages/Analytics')); 
const Settings = React.lazy(() => import('./pages/Settings'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const TeamChat = React.lazy(() => import('./pages/TeamChat'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const ChecklistTemplates = React.lazy(() => import('./pages/ChecklistTemplates'));
const Properties = React.lazy(() => import('./pages/Properties'));

// Reusable Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes with AppLayout */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Home />
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
            path="/housekeeping" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Housekeeping />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/maintenance" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Maintenance />
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
            path="/reports" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
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
            path="/team-chat" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TeamChat />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <UserProfile />
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
          
          {/* Admin Routes */}
          <Route 
            path="/checklist-templates" 
            element={
              <ProtectedRoute requiredRoles={["superadmin"]}>
                <AppLayout>
                  <ChecklistTemplates />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
