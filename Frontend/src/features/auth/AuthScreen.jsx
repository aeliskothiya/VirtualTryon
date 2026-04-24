import { useState } from 'react'
import { useAppContext } from '../../app/AppContext'

const registerDefaults = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
}

const loginDefaults = {
  email: '',
  password: '',
}

export function AuthScreen() {
  const { authState, login, register } = useAppContext()
  const [mode, setMode] = useState('register')
  const [registerForm, setRegisterForm] = useState(registerDefaults)
  const [loginForm, setLoginForm] = useState(loginDefaults)

  async function handleRegisterSubmit(event) {
    event.preventDefault()
    await register(registerForm)
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()
    await login(loginForm)
  }

  return (
    <main className="auth-layout">
      <section className="hero-panel">
        <div className="eyebrow">FashionAI virtual try-on</div>
        <h1>Build looks around your real wardrobe, not demo data.</h1>
        <p className="hero-copy">
          This frontend is wired to your FastAPI backend with a scalable structure for auth, wardrobe
          uploads, recommendations, and try-on generation.
        </p>
        <div className="hero-points">
          <div className="stat-card">
            <span>2-step onboarding</span>
            <strong>JWT + profile completion</strong>
          </div>
          <div className="stat-card">
            <span>Feature modules</span>
            <strong>Auth, wardrobe, try-on, profile</strong>
          </div>
          <div className="stat-card">
            <span>Backend aligned</span>
            <strong>Files, JSON, history, coins</strong>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="tab-row">
          <button
            className={mode === 'register' ? 'tab-button active' : 'tab-button'}
            type="button"
            onClick={() => setMode('register')}
          >
            Create account
          </button>
          <button
            className={mode === 'login' ? 'tab-button active' : 'tab-button'}
            type="button"
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
        </div>

        <div className="card">
          <h2>{mode === 'register' ? 'Register step 1' : 'Login'}</h2>
          <p className="muted">
            {mode === 'register'
              ? 'Create the user and receive a bearer token immediately.'
              : 'Resume your session and load your wardrobe workspace.'}
          </p>

          {authState.error ? <div className="message error">{authState.error}</div> : null}

          {mode === 'register' ? (
            <form className="stack-form" onSubmit={handleRegisterSubmit}>
              <label>
                Name
                <input
                  required
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <label>
                Confirm password
                <input
                  required
                  type="password"
                  value={registerForm.confirm_password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      confirm_password: event.target.value,
                    }))
                  }
                />
              </label>
              <button className="primary-button" type="submit" disabled={authState.loading}>
                {authState.loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form className="stack-form" onSubmit={handleLoginSubmit}>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Password
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button className="primary-button" type="submit" disabled={authState.loading}>
                {authState.loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
