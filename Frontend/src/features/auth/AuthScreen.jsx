import { useAppContext } from '../../app/AppContext'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

const modeDetails = {
  login: {
    title: 'Sign in',
    eyebrow: 'Welcome back',
    copy: 'Resume your wardrobe workspace and continue styling from your saved session.',
    button: 'Sign in',
  },
  register: {
    title: 'Create account',
    eyebrow: 'Start here',
    copy: 'Create your account, then complete profile setup to unlock recommendations and try-on.',
    button: 'Create account',
  },
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active
          ? 'bg-[#c65d2c] text-white shadow-sm'
          : 'bg-white/80 text-stone-500 hover:bg-white hover:text-stone-800'
      }`}
    >
      {children}
    </button>
  )
}

export function AuthScreen({ mode = 'login', onModeChange }) {
  const { authState } = useAppContext()
  const activeMode = modeDetails[mode] ? mode : 'login'

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[1.1fr_0.9fr] lg:px-6 xl:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-stone-950 p-8 text-stone-50 shadow-soft lg:p-10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-[#c65d2c]/20 blur-3xl" />
          <div className="absolute right-[-6rem] bottom-[-6rem] h-72 w-72 rounded-full bg-[#295a74]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f7d0b8]">
                FashionAI workspace
              </span>
              <span className="rounded-full border border-[#c65d2c]/20 bg-[#c65d2c]/10 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f7d0b8]">
                Tailwind rebuild
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.92] tracking-tight text-white md:text-6xl xl:text-7xl">
                Styled around your real wardrobe, not a generic dashboard.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-stone-300 md:text-base">
                Sign in to manage profile data, wardrobe uploads, recommendation runs, and virtual try-on in a
                workspace that feels deliberate, clean, and product-grade.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Fast onboarding</p>
              <p className="mt-2 font-medium text-stone-100">Login, finish profile, start styling</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Focused pages</p>
              <p className="mt-2 font-medium text-stone-100">Profile, wardrobe, recommendations, try-on</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-sm backdrop-blur">
              <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-400">Clean history</p>
              <p className="mt-2 font-medium text-stone-100">Pricing, coins, and generated outputs</p>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-5 shadow-soft backdrop-blur-xl md:p-6">
        <div className="flex rounded-[24px] bg-white/70 p-1.5">
          <TabButton active={activeMode === 'login'} type="button" onClick={() => onModeChange('login')}>
            Sign in
          </TabButton>
          <TabButton active={activeMode === 'register'} type="button" onClick={() => onModeChange('register')}>
            Create account
          </TabButton>
        </div>

        <div className="mt-6 space-y-2">
          <span className="inline-flex w-fit rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#8d401d]">
            {modeDetails[activeMode].eyebrow}
          </span>
          <h2 className="font-serif text-3xl tracking-tight text-stone-950 md:text-4xl">
            {modeDetails[activeMode].title}
          </h2>
          <p className="max-w-xl text-sm leading-7 text-stone-500">{modeDetails[activeMode].copy}</p>
        </div>

        {authState.error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authState.error}
          </div>
        ) : null}

        <div className="mt-6">
          {activeMode === 'login' ? <LoginPage /> : null}
          {activeMode === 'register' ? <RegisterPage /> : null}
        </div>
      </section>
    </main>
  )
}