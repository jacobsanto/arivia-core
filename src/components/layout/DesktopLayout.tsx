/**
 * Dedicated desktop layout component with optimized desktop patterns
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/services/state/app-state';

export const DesktopLayout: React.FC = () => {
  const { collapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header onMobileMenuToggle={() => {}} />
        
        {/* Content */}
        <ScrollArea className="flex-1" orientation="vertical">
          <main 
            id="main-content" 
            className={`p-6 transition-all duration-200 ${
              collapsed ? 'ml-0' : 'ml-0'
            }`}
            role="main"
          >
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};