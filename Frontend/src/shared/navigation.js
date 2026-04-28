const AUTH_MODES = new Set(['login', 'register'])
const ADMIN_MODES = new Set(['login', 'dashboard', 'coins'])
const APP_PAGES = new Set(['overview', 'profile', 'wardrobe', 'recommendations', 'tryon', 'activity'])

function normalizeScope(scope) {
  if (scope === 'app' || scope === 'admin') {
    return scope
  }

  return 'auth'
}

function normalizePage(scope, page) {
  if (scope === 'app' && APP_PAGES.has(page)) {
    return page
  }

  if (scope === 'auth' && AUTH_MODES.has(page)) {
    return page
  }

  if (scope === 'admin' && ADMIN_MODES.has(page)) {
    return page
  }

  if (scope === 'admin') {
    return 'login'
  }

  return scope === 'app' ? 'overview' : 'login'
}

export function getRouteFromHash(hash, hasSession) {
  const rawHash = String(hash || '').replace(/^#/, '')
  const [rawScope, rawPage] = rawHash.split('/')
  const fallbackScope = hasSession?.kind === 'admin' ? 'admin' : hasSession ? 'app' : 'auth'
  const scope = normalizeScope(rawScope || fallbackScope)
  const page = normalizePage(scope, rawPage || '')

  return { scope, page }
}

export function setRouteHash(scope, page) {
  if (typeof window === 'undefined') {
    return
  }

  window.location.hash = `${scope}/${page}`
}

export function getDefaultRoute(hasSession) {
  return hasSession?.kind === 'admin'
    ? { scope: 'admin', page: 'dashboard' }
    : hasSession
      ? { scope: 'app', page: 'overview' }
      : { scope: 'auth', page: 'login' }
}