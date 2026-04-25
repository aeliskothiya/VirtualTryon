const AUTH_MODES = new Set(['login', 'register'])
const APP_PAGES = new Set(['overview', 'profile', 'wardrobe', 'recommendations', 'tryon', 'activity'])

function normalizeScope(scope) {
  return scope === 'app' ? 'app' : 'auth'
}

function normalizePage(scope, page) {
  if (scope === 'app' && APP_PAGES.has(page)) {
    return page
  }

  if (scope === 'auth' && AUTH_MODES.has(page)) {
    return page
  }

  return scope === 'app' ? 'overview' : 'login'
}

export function getRouteFromHash(hash, hasSession) {
  const rawHash = String(hash || '').replace(/^#/, '')
  const [rawScope, rawPage] = rawHash.split('/')
  const fallbackScope = hasSession ? 'app' : 'auth'
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
  return hasSession ? { scope: 'app', page: 'overview' } : { scope: 'auth', page: 'login' }
}