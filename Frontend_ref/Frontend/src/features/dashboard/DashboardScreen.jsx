import { useEffect, useRef } from 'react'
import { useAppContext } from '../../app/AppContext'
import { useToast } from '../../shared/components/ToastProvider'
import { StickyNavbar } from '../../shared/components/StickyNavbar'
import { MetricCard } from '../../shared/ui/MetricCard'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { WardrobePage } from './pages/WardrobePage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { TryOnPage } from './pages/TryOnPage'
import { ActivityPage } from './pages/ActivityPage'

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
    title: 'Usage and plans',
    copy: 'Review subscription limits and saved usage history.',
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
  const { clearNotice, dashboardState, data, notice, session } = useAppContext()
  const { addToast } = useToast()
  const warnedExpiredRef = useRef(false)
  const activePage = pageComponents[page] ? page : 'overview'
  const PageComponent = pageComponents[activePage]
  const user = session.user
  const currentPlan = data.subscriptionPlans.find((item) => item.code === user?.subscription_plan) || null
  const wardrobeUsed = user?.wardrobe_used
  const wardrobeLimit = user?.wardrobe_limit
  const tryonsUsed = user?.tryons_used_today
  const isSubscriptionExpired = user?.is_subscription_expired
  const tryonLimit = user?.tryon_daily_limit
  const recommendationsUsed = user?.recommendations_used_today
  const recommendationLimit = user?.recommendation_daily_limit
  const savedTryonsUsed = user?.saved_tryons_used_this_month
  const savedTryonLimit = user?.saved_tryon_monthly_limit
  const cycleEnd = user?.subscription_cycle_end

  const summaryMetrics = [
    {
      label: 'Plan',
      value: currentPlan?.name || user?.subscription_plan || 'free',
      detail: user?.is_fully_registered ? 'Current subscription tier' : 'Complete profile setup',
    },
    {
      label: 'Wardrobe',
      value:
        wardrobeUsed !== undefined && wardrobeLimit !== undefined
          ? `${wardrobeUsed} / ${wardrobeLimit}`
          : `${data.wardrobe.length}${currentPlan ? ` / ${currentPlan.wardrobe_limit}` : ''}`,
      detail: 'Wardrobe items used / total',
    },
    {
      label: 'Try-on',
      value:
        tryonsUsed !== undefined && tryonLimit !== undefined
          ? `${tryonsUsed} / ${tryonLimit}`
          : 'Unlimited',
      detail: 'Daily try-on used / limit',
    },
    {
      label: 'Recommendations',
      value:
        recommendationsUsed !== undefined && recommendationLimit !== undefined && recommendationLimit !== null
          ? `${recommendationsUsed} / ${recommendationLimit}`
          : 'Unlimited',
      detail: 'Daily recommendations used / limit',
    },
    {
      label: 'Saved try-ons',
      value:
        savedTryonsUsed !== undefined && savedTryonLimit !== undefined
          ? `${savedTryonsUsed} / ${savedTryonLimit}`
          : `${data.tryons.length}`,
      detail: 'Saved outputs used / monthly limit',
    },
    {
      label: 'Plan expires',
      value: cycleEnd ? new Date(cycleEnd).toLocaleDateString() : 'N/A',
      detail: 'Current 28-day subscription cycle end',
    },
    {
      label: 'Subscription',
      value: isSubscriptionExpired ? 'Expired' : 'Active',
      detail: isSubscriptionExpired
        ? `Renew by ${cycleEnd ? new Date(cycleEnd).toLocaleDateString() : 'the end of the cycle'}`
        : 'Subscription access status',
    },
    {
      label: 'Account',
      value: user?.is_fully_registered ? 'Ready' : 'Pending',
      detail: 'Account readiness',
    },
  ]

  useEffect(() => {
    if (!notice) {
      return
    }

    addToast(notice, 'success')
    clearNotice()
  }, [notice, addToast, clearNotice])

  useEffect(() => {
    if (dashboardState.error) {
      addToast(dashboardState.error, 'error')
    }
  }, [dashboardState.error, addToast])

  useEffect(() => {
    if (dashboardState.loading) {
      addToast('Syncing with backend...', 'info', 1800)
    }
  }, [dashboardState.loading, addToast])

  useEffect(() => {
    if (!isSubscriptionExpired) {
      warnedExpiredRef.current = false
      return
    }

    if (!warnedExpiredRef.current) {
      addToast('Your current plan has expired. Renew to restore try-on and recommendations.', 'info', 4200)
      warnedExpiredRef.current = true
    }
  }, [isSubscriptionExpired, addToast])

  return (
    <div className="min-h-screen w-full">
      <StickyNavbar currentPage={activePage} onNavigate={onNavigate} />

      <main className="w-full px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <section className="space-y-4">
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
    </div>
  )
}
