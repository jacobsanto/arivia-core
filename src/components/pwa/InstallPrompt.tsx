import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if prompt was dismissed before
    const promptDismissed = localStorage.getItem('installPromptDismissed');
    const dismissedDate = promptDismissed ? parseInt(promptDismissed) : 0;
    const daysSinceDismissal = (Date.now() - dismissedDate) / (1000 * 60 * 60 * 24);

    // Show prompt again after 7 days
    if (daysSinceDismissal > 7 || !promptDismissed) {
      setShowPrompt(!isInStandaloneMode);
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Install App</CardTitle>
                <CardDescription className="text-xs">
                  Add to home screen for quick access
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mr-2 -mt-1"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {isIOS ? (
            <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">To install on iOS:</p>
              <ol className="space-y-1 pl-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  1. Tap the <Share className="inline h-4 w-4" /> Share button
                </li>
                <li className="flex items-center gap-2">
                  2. Select <Plus className="inline h-4 w-4" /> Add to Home Screen
                </li>
                <li>3. Tap Add</li>
              </ol>
            </div>
          ) : (
            <Button 
              onClick={handleInstallClick} 
              className="w-full"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Works offline • Fast loading • Native app experience
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
