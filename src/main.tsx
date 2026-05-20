import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { clearStaleMockAuth } from './utils/adminAuth'
import './i18n'
import './index.css'
import App from './App.tsx'

function Bootstrap() {
  useEffect(() => {
    clearStaleMockAuth();
  }, []);

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
)
