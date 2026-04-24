const STORAGE_KEY = 'fashion-ai-session'

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { token: '', user: null }
  } catch {
    return { token: '', user: null }
  }
}

export function saveSession(session) {
  if (!session?.token) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
