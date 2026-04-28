const STORAGE_KEY = 'fashion-ai-session'

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { kind: 'user', token: '', user: null }
    }

    const parsed = JSON.parse(raw)
    return {
      kind: parsed.kind || 'user',
      token: parsed.token || '',
      user: parsed.user || null,
    }
  } catch {
    return { kind: 'user', token: '', user: null }
  }
}

export function saveSession(session) {
  if (!session?.token) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
