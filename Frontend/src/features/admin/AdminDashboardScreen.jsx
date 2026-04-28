import { useAppContext } from '../../app/AppContext'
import { MetricCard } from '../../shared/ui/MetricCard'
import { Panel } from '../../shared/ui/Panel'

export function AdminDashboardScreen({ onNavigate }) {
  const { adminOverview, coinPackages, logout, session } = useAppContext()
  const admin = session.user

  const metrics = [
    { label: 'Users', value: adminOverview?.total_users ?? 0, detail: 'Total registered users' },
    { label: 'Registered', value: adminOverview?.fully_registered_users ?? 0, detail: 'Completed step 2' },
    { label: 'Admins', value: adminOverview?.total_admins ?? 0, detail: 'Admin accounts' },
    { label: 'Try-ons', value: adminOverview?.total_tryons ?? 0, detail: 'Generated jobs' },
    { label: 'Recommendations', value: adminOverview?.total_recommendations ?? 0, detail: 'Generated runs' },
    { label: 'Coin balance', value: adminOverview?.total_coin_balance ?? 0, detail: 'All users combined' },
    { label: 'Coin txns', value: adminOverview?.total_coin_transactions ?? 0, detail: 'Usage history' },
    { label: 'Packages', value: coinPackages.length, detail: 'Premium coin bundles' },
  ]

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-4 lg:px-6 xl:px-8">
      <section className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8d401d]">
              Admin dashboard
            </span>
            <h1 className="font-serif text-4xl tracking-tight text-stone-950">Analytics overview</h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-500">
              Keep this page focused on usage, growth, and system activity. Pricing and premium bundle controls live in a separate page.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <Panel>
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-stone-400">Signed in as</p>
              <p className="mt-2 text-xl font-semibold text-stone-950">{admin?.name}</p>
              <p className="mt-1 text-sm text-stone-500">{admin?.email}</p>
              <div className="mt-4 grid gap-3">
                <button
                  className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126]"
                  type="button"
                  onClick={() => onNavigate?.('coins')}
                >
                  Open Coins & Premiums
                </button>
                <button
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                  type="button"
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel>
            <div className="mb-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Dashboard focus</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">What this page shows</h2>
              <p className="mt-2 text-sm text-stone-500">
                Platform usage, coin totals, and high-level activity without the pricing controls crowding the page.
              </p>
            </div>
            <div className="space-y-3 text-sm text-stone-600">
              <p>Dashboard route: #/admin/dashboard</p>
              <p>Coins route: #/admin/coins</p>
              <p>Backend login endpoint: POST /admin/login</p>
            </div>
          </Panel>

          <Panel>
            <div className="mb-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Next action</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Go to coin setup</h2>
              <p className="mt-2 text-sm text-stone-500">
                Use the dedicated Coins & Premiums page to manage try-on pricing, recommendation pricing, and premium packs.
              </p>
            </div>
            <button
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
              type="button"
              onClick={() => onNavigate?.('coins')}
            >
              Manage Coins & Premiums
            </button>
          </Panel>
        </div>
      </section>
    </main>
  )
}
