/**
 * Admin Settings Header component - mobile-friendly header with search
 */
import React, { useState } from 'react';
import { ArrowLeft, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveContainer } from '@/components/ui/mobile/mobile-responsive';
import { toast } from 'sonner';

export const AdminSettingsHeader: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    // In a real app, you would implement logic to filter/highlight matched settings
    if (e.target.value.length > 2) {
      toast.info("Search feature", {
        description: `Searching for "${e.target.value}" in settings`
      });
    }
  };
  
  return (
    <ResponsiveContainer
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      mobileClassName="space-y-4"
      desktopClassName="flex-row items-center"
    >
      {/* Title Section */}
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="mr-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="md:text-3xl font-bold tracking-tight flex items-center text-xl px-px">
            <Settings className="mr-2 h-7 w-7" /> 
            System Settings
          </h1>
          <p className="text-sm text-muted-foreground tracking-tight px-0 mx-0">
            Configure global system settings
          </p>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="flex items-center w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            className="pl-8 pr-4"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
    </ResponsiveContainer>
  );
};