
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";

const MainLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useUser();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  // If no user is logged in, just render the outlet (login/signup pages will handle redirects)
  if (!user) {
    return <Outlet />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onMobileMenuToggle={toggleMobileMenu} />
      
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <Sidebar />
        
        {/* Mobile sidebar */}
        <MobileSidebar 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
        
        {/* Main content */}
        <main className="flex-1 bg-background p-6 overflow-auto">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
