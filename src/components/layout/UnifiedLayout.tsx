
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/auth";
import { useDevMode } from "@/contexts/DevModeContext";

const UnifiedLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isDevMode } = useDevMode();
  const location = useLocation();
  
  // Debug logging to see what's happening
  console.log('UnifiedLayout Debug:', { 
    isMobile, 
    user: user?.name, 
    mobileMenuOpen,
    pathname: location.pathname
  });
  
  const toggleMobileMenu = () => {
    console.log('Toggling mobile menu from', mobileMenuOpen, 'to', !mobileMenuOpen);
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className={`flex min-h-screen bg-background overflow-hidden ${isDevMode ? 'pt-12' : ''}`}>
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        <ScrollArea className="flex-1" orientation="vertical">
          <main id="main-content" className={`p-2 md:p-6 ${isMobile ? 'pb-20' : ''}`} role="main">
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </ScrollArea>
        
        {/* Mobile navigation - only visible on mobile */}
        {isMobile && (
          <>
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <MobileBottomNav onOpenMenu={toggleMobileMenu} />
          </>
        )}
        
        {/* Always render mobile nav for debugging if no user */}
        {!user && (
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-red-500 text-white text-center p-4 z-50">
            DEBUG: No user found - Navigation hidden
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedLayout;
