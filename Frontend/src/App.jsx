import { useEffect, useState } from 'react'
import { AppProvider } from './app/AppProvider'
import { useAppContext } from './app/AppContext'
import { AuthScreen } from './features/auth/AuthScreen'
import { AdminDashboardScreen } from './features/admin/AdminDashboardScreen'
import { AdminCoinsScreen } from './features/admin/AdminCoinsScreen'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import { getDefaultRoute, getRouteFromHash, setRouteHash } from './shared/navigation'

function AppContent() {
  const { session } = useAppContext()
  const [route, setRoute] = useState(() => getDefaultRoute(session))

  useEffect(() => {
    function syncRoute() {
      setRoute(getRouteFromHash(window.location.hash, session))
    }

    syncRoute()
    window.addEventListener('hashchange', syncRoute)

    return () => window.removeEventListener('hashchange', syncRoute)
  }, [session.kind, session.token])

  useEffect(() => {
    const desiredScope = session.kind === 'admin' ? 'admin' : session.token ? 'app' : 'auth'
    const desiredPage =
      session.kind === 'admin'
        ? route.scope === 'admin'
          ? route.page
          : 'dashboard'
        : session.token
          ? route.scope === 'app'
            ? route.page
            : 'overview'
          : 'login'

    if (window.location.hash !== `#${desiredScope}/${desiredPage}`) {
      setRouteHash(desiredScope, desiredPage)
    }
  }, [session.kind, session.token])

  if (session.kind === 'admin') {
    if (route.page === 'coins') {
      return <AdminCoinsScreen page={route.page} onNavigate={(page) => setRouteHash('admin', page)} />
    }

    return <AdminDashboardScreen page={route.page} onNavigate={(page) => setRouteHash('admin', page)} />
  }

  if (!session.token) {
    const authMode = route.scope === 'auth' && route.page === 'register' ? 'register' : 'login'
    return <AuthScreen mode={authMode} onModeChange={(mode) => setRouteHash('auth', mode)} />
  }

  const activeRoute = route.scope === 'app' ? route : getDefaultRoute(session)

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
