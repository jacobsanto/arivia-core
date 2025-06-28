
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { TenantProvider } from './lib/context/TenantContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
    <TenantProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </TenantProvider>
  </QueryClientProvider>
);
