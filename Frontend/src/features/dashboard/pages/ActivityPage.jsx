import { useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { setRouteHash } from '../../../shared/navigation'
import { Panel } from '../../../shared/ui/Panel'

export function ActivityPage() {
  const { data, session, purchasePlan } = useAppContext()
  const [downgradeModal, setDowngradeModal] = useState(null)
  const currentPlanCode = session.user?.subscription_plan || 'free'
  const hasUsedFreePlan = session.user?.has_used_free_plan || false

  // Filter plans: hide free plan if user already used it and is not currently on it
  const visiblePlans = data.subscriptionPlans.filter((plan) => {
    if (plan.code === 'free' && hasUsedFreePlan && currentPlanCode !== 'free') {
      return false
    }
    return true
  })

  const isSubscriptionExpired = session.user?.is_subscription_expired
  const currentWardrobeCount = data.wardrobe.length

  async function handlePurchase(planCode) {
    const isSamePlan = planCode === currentPlanCode
    const allowRenew = isSamePlan && isSubscriptionExpired
    if (isSamePlan && !allowRenew) {
      return
    }

    const targetPlan = data.subscriptionPlans.find((plan) => plan.code === planCode)
    if (targetPlan && targetPlan.wardrobe_limit < currentWardrobeCount) {
      setDowngradeModal({
        planCode,
        planName: targetPlan.name,
        newLimit: targetPlan.wardrobe_limit,
        currentCount: currentWardrobeCount,
      })
      return
    }

    await purchasePlan(planCode)
  }

  return (
    <div className="space-y-4">
      {isSubscriptionExpired ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          Your active subscription has expired. Renew a plan to resume try-on and recommendation usage.
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Plans</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Subscription tiers</h3>
          <p className="mt-2 text-sm text-stone-500">
            Choose a plan card to upgrade your wardrobe limit, try-on quota, and saved-output benefits.
          </p>
        </div>

        <div className="grid gap-4">
          {visiblePlans.map((item) => {
            const isCurrent = item.code === currentPlanCode
            const isActive = item.active !== false
            const isCurrentExpired = isCurrent && isSubscriptionExpired
            const isUnlimitedRecommendations = item.recommendation_daily_limit === null
            const monthlyPrice = Number(item.price_inr ?? 0)
            const priceDisplay = monthlyPrice === 0 ? 'Free' : `₹${monthlyPrice.toLocaleString('en-IN')} / month`
            const canPurchaseThisPlan = isActive && (!isCurrent || isCurrentExpired)

            return (
              <article
                key={item.code}
                className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">{item.code}</p>
                    <h4 className="mt-2 font-serif text-3xl text-stone-950">{item.name}</h4>
                    <p className="mt-1 text-sm font-semibold text-[#8d401d]">{priceDisplay}</p>
                    <p className="mt-2 max-w-lg text-sm leading-7 text-stone-500">{item.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {isCurrentExpired ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Expired plan
                      </span>
                    ) : isCurrent ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Current plan
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handlePurchase(item.code)}
                      disabled={!canPurchaseThisPlan}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                        !canPurchaseThisPlan
                          ? 'cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400'
                          : 'bg-[#c65d2c] text-white hover:bg-[#b65126]'
                      }`}
                    >
                      {isCurrentExpired
                        ? 'Renew plan'
                        : isCurrent
                          ? 'Purchased'                          
                            : 'Purchase plan'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Wardrobe</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">{item.wardrobe_limit} items</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Try-on</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">{item.tryon_daily_limit} / day</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Recommendations</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      {isUnlimitedRecommendations ? 'Unlimited' : `${item.recommendation_daily_limit} / day`}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Saved try-ons</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      {item.saved_tryon_monthly_limit === 0 ? 'Preview only' : `${item.saved_tryon_monthly_limit} / month`}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Saved outputs</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Recent history</h3>
        </div>

        <div className="space-y-3">
          {data.tryons.map((item) => (
            <div key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-950">{item.is_saved ? 'Saved try-on' : 'Preview try-on'}</p>
                  <p className="mt-1 text-xs text-stone-500">{item.input_photo_used} photo</p>
                </div>
                <span className="text-xs text-stone-400">{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}
          {!data.tryons.length ? <p className="text-sm text-stone-500">No saved try-ons yet.</p> : null}
        </div>
      </Panel>
      </div>

      {downgradeModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-stone-950">Downgrade blocked</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              You currently have {downgradeModal.currentCount} wardrobe item(s), but the {downgradeModal.planName} plan allows only {downgradeModal.newLimit}.
            </p>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Deactivate or delete extra items before downgrading, or stay on your current plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126]"
                onClick={() => {
                  setRouteHash('app', 'wardrobe')
                  setDowngradeModal(null)
                }}
              >
                Remove extra items
              </button>
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                onClick={() => setDowngradeModal(null)}
              >
                Stay on current plan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
