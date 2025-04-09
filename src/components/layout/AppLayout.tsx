
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNavigation from "./MobileNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar - hidden on mobile */}
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile navigation - only visible on mobile */}
        {isMobile && (
          <MobileNavigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default AppLayout;
