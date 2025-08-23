import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  sidebar,
  sidebarOpen,
  onToggleSidebar,
  title = "Team Chat",
  subtitle = "Communicate in real-time with your team members."
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Chat Container */}
      <div className="flex flex-1 gap-4 h-full">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? (
            sidebarOpen 
              ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              : "hidden"
          ) : "w-80 flex-shrink-0"
        )}>
          {isMobile && sidebarOpen && (
            <div 
              className="absolute inset-0 bg-background/80" 
              onClick={onToggleSidebar}
            />
          )}
          <div className={cn(
            "h-full bg-background",
            isMobile ? "w-80 border-r shadow-lg" : "w-full"
          )}>
            {sidebar}
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};