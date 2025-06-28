
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileSidebar } from './MobileSidebar';
import { MobileNavigation } from './MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const UnifiedLayout: React.FC = () => {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(true)} />
      
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 border-r bg-background">
            <Sidebar />
          </aside>
        )}
        
        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebar 
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 pb-20 md:pb-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default UnifiedLayout;
