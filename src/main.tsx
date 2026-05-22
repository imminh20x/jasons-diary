import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { clearStaleMockAuth } from './utils/adminAuth'
import './i18n'
import './index.css'
import App from './App.tsx'

clearStaleMockAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
