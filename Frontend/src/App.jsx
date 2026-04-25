import { useEffect, useState } from 'react'
import { AppProvider } from './app/AppProvider'
import { useAppContext } from './app/AppContext'
import { AuthScreen } from './features/auth/AuthScreen'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import { getDefaultRoute, getRouteFromHash, setRouteHash } from './shared/navigation'

function AppContent() {
  const { session } = useAppContext()
  const [route, setRoute] = useState(() => getDefaultRoute(Boolean(session.token)))

  useEffect(() => {
    function syncRoute() {
      setRoute(getRouteFromHash(window.location.hash, Boolean(session.token)))
    }

    syncRoute()
    window.addEventListener('hashchange', syncRoute)

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [session.token])

  useEffect(() => {
    const desiredScope = session.token ? 'app' : 'auth'
    const desiredPage = session.token ? 'overview' : 'login'

    if (window.location.hash !== `#${desiredScope}/${desiredPage}`) {
      setRouteHash(desiredScope, desiredPage)
    }
  }, [session.token])

  const activeRoute = session.token
    ? route.scope === 'app'
      ? route
      : getDefaultRoute(true)
    : route.scope === 'auth'
      ? route
      : getDefaultRoute(false)

  if (!session.token) {
    return <AuthScreen mode={activeRoute.page} onModeChange={(mode) => setRouteHash('auth', mode)} />
  }

  return <DashboardScreen page={activeRoute.page} onNavigate={(page) => setRouteHash('app', page)} />
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
