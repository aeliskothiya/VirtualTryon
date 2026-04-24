import { AppProvider } from './app/AppProvider'
import { useAppContext } from './app/AppContext'
import { AuthScreen } from './features/auth/AuthScreen'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import './styles/app.css'

function AppContent() {
  const { session } = useAppContext()

  if (!session.token) {
    return <AuthScreen />
  }

  return <DashboardScreen />
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
