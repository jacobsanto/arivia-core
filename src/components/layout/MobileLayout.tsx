/**
 * Dedicated mobile layout component with optimized mobile patterns
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SafeArea } from '@/components/ui/mobile/mobile-responsive';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import MobileSidebar from './mobile/MobileSidebar';
import { useMobileMenu } from '@/services/state/app-state';

export const MobileLayout: React.FC = () => {
  const { isOpen: mobileMenuOpen, setOpen: setMobileMenuOpen } = useMobileMenu();
  
  return (
    <SafeArea bottom className="flex flex-col min-h-screen bg-background">
      {/* Mobile Header */}
      <MobileHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      {/* Main Content */}
      <ScrollArea className="flex-1" orientation="vertical">
        <main id="main-content" className="p-4 pb-20" role="main">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </ScrollArea>
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
      
      {/* Bottom Navigation */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
    </SafeArea>
  );
};