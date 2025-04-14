
import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";

const UnifiedLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, isLoading } = useUser();
  const location = useLocation();
  
  // Determine if we're on a public route (like login) that doesn't need authentication
  const isPublicRoute = location.pathname === '/login';

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Handle authentication routing
  if (!user && !isPublicRoute) {
    // Redirect to login if not authenticated and trying to access protected route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && isPublicRoute) {
    // Redirect to dashboard if already authenticated and trying to access public route
    return <Navigate to="/dashboard" replace />;
  }

  // For the login page, render just the content without any layout
  if (isPublicRoute) {
    return <Outlet />;
  }

  // For authenticated routes, render the full app layout
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-6 ${isMobile ? 'pb-20' : ''}`}>
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile navigation - only visible on mobile */}
        {isMobile && (
          <>
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <MobileBottomNav onOpenMenu={toggleMobileMenu} />
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedLayout;
