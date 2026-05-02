import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { getMediaUrl } from '../../../shared/api/client'
import { MetricCard } from '../../../shared/ui/MetricCard'
import { Panel } from '../../../shared/ui/Panel'

export function OverviewPage() {
  const { data, session } = useAppContext()
  const user = session.user
  const currentPlan = data.subscriptionPlans.find((item) => item.code === user?.subscription_plan) || null
  const isSubscriptionExpired = user?.is_subscription_expired

  const metrics = [
    {
      label: 'Plan',
      value: currentPlan?.name || user?.subscription_plan || 'free',
      detail: user?.is_fully_registered ? 'Current subscription tier' : 'Complete profile setup',
    },
    {
      label: 'Wardrobe',
      value: currentPlan ? `${data.wardrobe.length} / ${currentPlan.wardrobe_limit}` : data.wardrobe.length,
      detail: 'Saved clothing items',
    },
    { label: 'Recommendations', value: data.recommendations.length, detail: 'Request history' },
    { label: 'Saved try-ons', value: data.tryons.length, detail: 'Saved generated looks' },
  ]

  return (
    <div className="space-y-6">
      {isSubscriptionExpired ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          Your subscription has expired. Upgrade now to restore daily try-on and recommendations.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="mb-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Account status</p>
            <h3 className="mt-2 font-serif text-2xl text-stone-950">{user?.name}</h3>
            <p className="mt-1 text-sm text-stone-500">{user?.email}</p>
            <p className="mt-2 text-sm font-semibold text-stone-700">Plan: {currentPlan?.name || user?.subscription_plan || 'free'}</p>
          </div>

          <div className="flex items-center gap-4 rounded-3xl border border-stone-200 bg-white p-4">
            {user?.profile_photo_url ? (
              <img
                className="h-16 w-16 rounded-2xl object-cover"
                src={getMediaUrl(user.profile_photo_url)}
                alt={user.name}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c65d2c]/10 font-serif text-2xl text-[#8d401d]">
                {user?.name?.slice(0, 1) || 'F'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-stone-950">
                {user?.is_fully_registered ? 'Fully registered' : 'Registration step 2 pending'}
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                {user?.is_fully_registered
                  ? 'Your styling workspace is ready.'
                  : 'Finish profile setup to unlock wardrobe, recommendations, and try-on.'}
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="mb-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Recent recommendations</p>
            <h3 className="mt-2 font-serif text-2xl text-stone-950">Latest matching runs</h3>
          </div>
          <div className="space-y-3">
            {data.recommendations.slice(0, 3).map((entry) => (
              <div key={entry.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{entry.suggested_top_ids.length} suggestions</p>
                    <p className="mt-1 text-xs text-stone-500">{entry.occasion || 'No occasion'}</p>
                  </div>
                  <span className="text-xs text-stone-400">{formatDateTime(entry.created_at)}</span>
                </div>
              </div>
            ))}
            {!data.recommendations.length ? <p className="text-sm text-stone-500">No recommendations yet.</p> : null}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <div className="mb-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Recent try-ons</p>
            <h3 className="mt-2 font-serif text-2xl text-stone-950">Latest generated looks</h3>
          </div>
          <div className="space-y-3">
            {data.tryons.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">{item.status}</p>
                    <p className="mt-1 text-xs text-stone-500">{item.input_photo_used} photo</p>
                  </div>
                  <span className="text-xs text-stone-400">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
            {!data.tryons.length ? <p className="text-sm text-stone-500">No try-on jobs yet.</p> : null}
          </div>
        </Panel>

        <Panel>
          <div className="mb-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Wardrobe snapshot</p>
            <h3 className="mt-2 font-serif text-2xl text-stone-950">Saved clothing items</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.wardrobe.slice(0, 4).map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <img src={getMediaUrl(item.image_url)} alt={item.type} className="aspect-square w-full object-cover" />
                <div className="space-y-1 p-4">
                  <p className="text-sm font-semibold text-stone-950">{item.type}</p>
                  <p className="text-xs text-stone-500">{formatDateTime(item.created_at)}</p>
                </div>
              </div>
            ))}
            {!data.wardrobe.length ? <p className="text-sm text-stone-500">No wardrobe items yet.</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  )
}
