import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { SocketProvider } from './context/SocketContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <UserProvider>
          <SocketProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SocketProvider>
        </UserProvider>
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
)
