import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Smartphone, 
  Zap, 
  WifiOff, 
  Bell,
  Share,
  Plus,
  Chrome,
  AppleIcon as Apple
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstallApp: React.FC = () => {
  const navigate = useNavigate();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance',
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'Access your data even without internet',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Stay updated with real-time alerts',
    },
    {
      icon: Smartphone,
      title: 'Native Experience',
      description: 'Feels like a native mobile app',
    },
  ];

  if (isStandalone) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>App Already Installed</CardTitle>
            <CardDescription>
              You're using the installed version of Arivia Villas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <Card className="border-2">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Download className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl mb-2">Install Arivia Villas</CardTitle>
            <CardDescription className="text-base">
              Get the full app experience with offline access and native features
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Installation Instructions */}
          {isIOS && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Apple className="h-5 w-5" />
                <span>Install on iOS (iPhone/iPad)</span>
              </div>
              <ol className="space-y-3 rounded-lg border p-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    1
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Open Safari browser</p>
                    <p className="text-sm text-muted-foreground">
                      This app must be installed from Safari on iOS
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      Tap the <Share className="inline h-4 w-4" /> Share button
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Located at the bottom of the screen (or top on iPad)
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    3
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      Select <Plus className="inline h-4 w-4" /> "Add to Home Screen"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Scroll down in the share menu to find this option
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    4
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Tap "Add"</p>
                    <p className="text-sm text-muted-foreground">
                      The app icon will appear on your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Chrome className="h-5 w-5" />
                <span>Install on Android</span>
              </div>
              <ol className="space-y-3 rounded-lg border p-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    1
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Tap the menu icon (⋮)</p>
                    <p className="text-sm text-muted-foreground">
                      Located in the top-right corner of Chrome
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      Select <Download className="inline h-4 w-4" /> "Install app" or "Add to Home screen"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Or look for the install banner at the bottom
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    3
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Tap "Install"</p>
                    <p className="text-sm text-muted-foreground">
                      The app will be added to your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Chrome className="h-5 w-5" />
                <span>Install on Desktop</span>
              </div>
              <ol className="space-y-3 rounded-lg border p-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    1
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Look for the install icon</p>
                    <p className="text-sm text-muted-foreground">
                      In the address bar (Chrome, Edge) or look for an install prompt
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                  <div className="space-y-1">
                    <p className="font-medium">Click "Install"</p>
                    <p className="text-sm text-muted-foreground">
                      The app will open in its own window
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full" 
            size="lg"
            variant="outline"
          >
            Continue in Browser
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Why Install?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstallApp;
