import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/common/LoadingStates';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load all main pages for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Properties = lazy(() => import('@/pages/Properties'));
const Housekeeping = lazy(() => import('@/pages/Housekeeping'));
const Maintenance = lazy(() => import('@/pages/Maintenance'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const TeamChat = lazy(() => import('@/pages/TeamChat'));
const Reports = lazy(() => import('@/pages/Reports'));
const Checklists = lazy(() => import('@/pages/Checklists'));

// Auth pages (keep these non-lazy for faster initial load)
import Login from '@/components/auth/LoginForm';
import Register from '@/components/auth/SignUpForm';
import CreateSuperAdmin from '@/components/auth/CreateSuperAdmin';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage text="Loading..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/create-super-admin" element={
        <PublicRoute>
          <CreateSuperAdmin />
        </PublicRoute>
      } />

      {/* Protected Main Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/properties" element={
        <ProtectedRoute>
          <Properties />
        </ProtectedRoute>
      } />
      <Route path="/housekeeping" element={
        <ProtectedRoute>
          <Housekeeping />
        </ProtectedRoute>
      } />
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Maintenance />
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute>
          <Inventory />
        </ProtectedRoute>
      } />
      <Route path="/team-chat" element={
        <ProtectedRoute>
          <TeamChat />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/checklists" element={
        <ProtectedRoute>
          <Checklists />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 fallback */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-muted-foreground mb-4">Page not found</p>
            <a href="/dashboard" className="text-primary hover:underline">
              Return to Dashboard
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
};
