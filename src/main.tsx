import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { clearStaleMockAuth } from './utils/adminAuth'
import { initI18n } from './i18n'
import './index.css'
import App from './App.tsx'

clearStaleMockAuth()

void initI18n()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error('Failed to initialize app:', error)
    const root = document.getElementById('root')
    if (root) {
      root.textContent = 'Unable to load the application. Please refresh the page.'
    }
  })
