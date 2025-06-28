
import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger, SwipeableTabsProvider } from "@/components/ui/tabs";
import { useUser } from "@/contexts/UserContext";
import UserInformation from "@/components/auth/UserInformation";
import SecurityActivity from "@/components/auth/SecurityActivity";
import PermissionsDisplay from "@/components/auth/PermissionsDisplay";
import OfflineDataTab from "@/components/profile/OfflineDataTab";
import ProfileTabNav from "@/components/profile/ProfileTabNav";
import SwipeIndicators from "@/components/profile/SwipeIndicators";
import { useProfileTabs } from "@/components/profile/ProfileTabDefinitions";
import { useSwipeHint } from "@/hooks/useSwipeHint";
import { useIsMobile } from "@/hooks/use-mobile";
import { profileToUser } from "@/types/auth/base";

const UserProfile = () => {
  const { user, canAccess } = useUser();
  const [activeTab, setActiveTab] = useState("info");
  const tabsRef = useRef(null);
  
  // Custom hooks
  const { showSwipeHint, isMobile } = useSwipeHint();
  
  // Convert user profile to User type for ProfileTabDefinitions
  const convertedUser = user ? profileToUser({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    secondary_roles: user.secondary_roles,
    custom_permissions: user.custom_permissions
  }) : null;
  
  const { tabs } = useProfileTabs(convertedUser, canAccess("viewPermissions"));
  
  // Tab navigation
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const hasNextTab = currentTabIndex < tabs.length - 1;
  const hasPrevTab = currentTabIndex > 0;
  
  const handleNextTab = () => {
    const nextTabIndex = Math.min(tabs.length - 1, currentTabIndex + 1);
    setActiveTab(tabs[nextTabIndex].id);
  };
  
  const handlePrevTab = () => {
    const prevTabIndex = Math.max(0, currentTabIndex - 1);
    setActiveTab(tabs[prevTabIndex].id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">My Profile</h1>

      <div className="relative">
        {/* Swipe indicators for mobile users */}
        {isMobile && (
          <SwipeIndicators 
            hasPrevTab={hasPrevTab} 
            hasNextTab={hasNextTab} 
            showSwipeHint={showSwipeHint} 
          />
        )}
      
        <SwipeableTabsProvider>
          <Tabs ref={tabsRef} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full scroll-tabs">
              {tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1">
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent 
              value="info"
              tabsRoot={tabsRef}
            >
              <UserInformation />
            </TabsContent>

            {canAccess("viewPermissions") && (
              <TabsContent 
                value="permissions"
                tabsRoot={tabsRef}
              >
                <PermissionsDisplay />
              </TabsContent>
            )}

            <TabsContent 
              value="security"
              tabsRoot={tabsRef}
            >
              <SecurityActivity />
            </TabsContent>

            <TabsContent 
              value="offline"
              tabsRoot={tabsRef}
            >
              <OfflineDataTab />
            </TabsContent>
          </Tabs>
        </SwipeableTabsProvider>
        
        {/* Tab navigation buttons for mobile */}
        {isMobile && (
          <ProfileTabNav
            currentTabIndex={currentTabIndex}
            hasPrevTab={hasPrevTab}
            hasNextTab={hasNextTab}
            onPrevTab={handlePrevTab}
            onNextTab={handleNextTab}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
