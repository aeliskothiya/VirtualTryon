import { useAppContext } from '../../app/AppContext'
import { NavItem } from '../../shared/ui/NavItem'
import { MetricCard } from '../../shared/ui/MetricCard'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { WardrobePage } from './pages/WardrobePage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { TryOnPage } from './pages/TryOnPage'
import { ActivityPage } from './pages/ActivityPage'

const navigationItems = ['overview', 'profile', 'wardrobe', 'recommendations', 'tryon', 'activity']

const pageInfo = {
  overview: {
    title: 'Workspace overview',
    copy: 'Quick status for your account, wardrobe, and recent styling activity.',
  },
  profile: {
    title: 'Profile studio',
    copy: 'Manage profile details, photo, and password separately from the other tools.',
  },
  wardrobe: {
    title: 'Wardrobe library',
    copy: 'Upload tops and bottoms, then sync embeddings when needed.',
  },
  recommendations: {
    title: 'Recommendation lab',
    copy: 'Build ranked top suggestions for a selected bottom and occasion.',
  },
  tryon: {
    title: 'Virtual try-on',
    copy: 'Generate try-on renders with an optional override photo.',
  },
  activity: {
    title: 'Usage and pricing',
    copy: 'Review pricing, coin transactions, and usage history.',
  },
}

const pageComponents = {
  overview: OverviewPage,
  profile: ProfilePage,
  wardrobe: WardrobePage,
  recommendations: RecommendationsPage,
  tryon: TryOnPage,
  activity: ActivityPage,
}

export function DashboardScreen({ page = 'overview', onNavigate = () => {} }) {
  const { clearNotice, dashboardState, logout, notice, session } = useAppContext()
  const activePage = pageComponents[page] ? page : 'overview'
  const PageComponent = pageComponents[activePage]
  const user = session.user

  const summaryMetrics = [
    {
      label: 'Coins',
      value: user?.coin_balance ?? 0,
      detail: user?.is_fully_registered ? 'Ready for styling actions' : 'Complete profile setup',
    },
    {
      label: 'Status',
      value: user?.is_fully_registered ? 'Active' : 'Pending',
      detail: 'Account readiness',
    },
    {
      label: 'Wardrobe',
      value: user?.is_fully_registered ? 'Ready' : 'Setup',
      detail: 'Feature access',
    },
    {
      label: 'Mode',
      value: activePage,
      detail: 'Current page',
    },
  ]

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6 xl:px-8">
      <aside className="sticky top-4 h-fit rounded-[32px] border border-white/10 bg-stone-950 p-6 text-stone-100 shadow-soft backdrop-blur-xl">
        <div className="space-y-4">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f7d0b8]">
              Connected workspace
            </span>
            <h1 className="mt-4 font-serif text-4xl leading-[0.95] tracking-tight text-white">{pageInfo[activePage].title}</h1>
            <p className="mt-3 text-sm leading-7 text-stone-300">{pageInfo[activePage].copy}</p>
          </div>

          <div className="space-y-3">
            {navigationItems.map((item) => (
              <NavItem
                key={item}
                active={activePage === item}
                label={item === 'overview' ? 'Dashboard' : item}
                title={pageInfo[item].title}
                onClick={() => onNavigate(item)}
              />
            ))}
          </div>

          <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <MetricCard label="Coins" value={user?.coin_balance ?? 0} detail="Current balance" />
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              type="button"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <section className="space-y-4">
        {notice ? (
          <div
            className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm"
            onClick={clearNotice}
            role="status"
          >
            {notice}
          </div>
        ) : null}
        {dashboardState.error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {dashboardState.error}
          </div>
        ) : null}
        {dashboardState.loading ? (
          <div className="rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 shadow-sm">
            Syncing with backend...
          </div>
        ) : null}

        <header className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-6 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8d401d]">
                {activePage}
              </span>
              <h2 className="font-serif text-4xl tracking-tight text-stone-950">{pageInfo[activePage].title}</h2>
              <p className="max-w-2xl text-sm leading-7 text-stone-500">{pageInfo[activePage].copy}</p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-4">
              {summaryMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </div>
        </header>

        <PageComponent />
      </section>
    </main>
  )
}
