import { AuthProvider } from './hooks/use-auth'
import { AppContent } from './app-content'
import { ErrorBoundary } from './components/error-boundary'
import { ToastProvider } from './hooks/use-toast'
import { ThemeProvider } from './hooks/use-theme'

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
    </ErrorBoundary>
  )
}
