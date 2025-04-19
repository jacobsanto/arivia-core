
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { useSwipe } from "@/hooks/use-swipe"

const Tabs = TabsPrimitive.Root

interface ExtendedTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  enableSwipe?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  ExtendedTabsListProps
>(({ className, enableSwipe = true, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto flex-nowrap",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

interface ExtendedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  // Add any additional props here if needed
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  ExtendedTabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm min-w-[80px]",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// Create a context to manage tab registration and navigation
interface TabsContentContextType {
  registerTab: (tabValue: string) => void;
  getNextTab: (currentTab: string) => string | null;
  getPreviousTab: (currentTab: string) => string | null;
  availableTabs: string[];
}

const TabsContentContext = React.createContext<TabsContentContextType>({
  registerTab: () => {},
  getNextTab: () => null,
  getPreviousTab: () => null,
  availableTabs: []
});

// Create a wrapper component for TabsContent that adds swipe functionality
interface SwipeableTabsContentProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  children: React.ReactNode;
  value: string;
  swipeEnabled?: boolean;
}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  SwipeableTabsContentProps
>(({ className, children, value, swipeEnabled = true, ...props }, ref) => {
  const { availableTabs, getNextTab, getPreviousTab } = React.useContext(TabsContentContext);
  const tabsRootRef = React.useContext(TabsRootContext);

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: () => {
      if (swipeEnabled && tabsRootRef) {
        const nextTab = getNextTab(value);
        if (nextTab) {
          const tabsElement = tabsRootRef as unknown as { setValue: (value: string) => void };
          if (tabsElement.setValue) {
            tabsElement.setValue(nextTab);
          }
        }
      }
    },
    onSwipeRight: () => {
      if (swipeEnabled && tabsRootRef) {
        const previousTab = getPreviousTab(value);
        if (previousTab) {
          const tabsElement = tabsRootRef as unknown as { setValue: (value: string) => void };
          if (tabsElement.setValue) {
            tabsElement.setValue(previousTab);
          }
        }
      }
    }
  });

  const gestureProps = swipeEnabled ? {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  } : {};

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      value={value}
      {...props}
      {...gestureProps}
    >
      {children}
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = "TabsContent"

// Create a context for the tabs root component
const TabsRootContext = React.createContext<React.RefObject<HTMLElement> | null>(null);

interface SwipeableTabsProviderProps {
  children: React.ReactNode;
}

const SwipeableTabsProvider = ({ children }: SwipeableTabsProviderProps) => {
  const [tabs, setTabs] = React.useState<string[]>([]);
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const registerTab = React.useCallback((tabValue: string) => {
    setTabs(prev => {
      if (!prev.includes(tabValue)) {
        return [...prev, tabValue];
      }
      return prev;
    });
  }, []);

  const getNextTab = React.useCallback((currentTab: string) => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex !== -1 && currentIndex < tabs.length - 1) {
      return tabs[currentIndex + 1];
    }
    return null;
  }, [tabs]);

  const getPreviousTab = React.useCallback((currentTab: string) => {
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex > 0) {
      return tabs[currentIndex - 1];
    }
    return null;
  }, [tabs]);

  return (
    <TabsRootContext.Provider value={tabsRef}>
      <TabsContentContext.Provider value={{ registerTab, getNextTab, getPreviousTab, availableTabs: tabs }}>
        {children}
      </TabsContentContext.Provider>
    </TabsRootContext.Provider>
  );
};

// Create a hook to use the swipeable tabs functionality
const useRegisterTab = (tabValue: string) => {
  const { registerTab } = React.useContext(TabsContentContext);
  
  React.useEffect(() => {
    if (tabValue) {
      registerTab(tabValue);
    }
  }, [tabValue, registerTab]);
};

// Export the enhanced components
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  SwipeableTabsProvider,
  useRegisterTab
}
