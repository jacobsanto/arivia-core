
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './setup/console-patch';
import { SupabaseUserProvider } from './contexts/SupabaseUserContext'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { initWebVitals } from './monitoring/webVitals';
import { registerSW } from 'virtual:pwa-register';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
})

// Make sure we have a root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SupabaseUserProvider>
        <App />
      </SupabaseUserProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Initialize Web Vitals after initial render
setTimeout(() => initWebVitals(), 0);

// Register Service Worker for PWA (auto update)
registerSW({ immediate: true });

