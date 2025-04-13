
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './contexts/UserContext'
import { ToastProvider } from './contexts/ToastContext'

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <ToastProvider>
      <App />
    </ToastProvider>
  </UserProvider>
);
