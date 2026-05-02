import { useMemo, useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { getMediaUrl } from '../../../shared/api/client'
import { setRouteHash } from '../../../shared/navigation'
import { FieldLabel } from '../../../shared/ui/Field'
import { Panel } from '../../../shared/ui/Panel'

const occasionOptions = [
  { value: '', label: 'No occasion filter' },
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'party', label: 'Party' },
  { value: 'sport', label: 'Sport' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'formal', label: 'Formal' },
]

export function RecommendationsPage() {
  const { dashboardState, data, runRecommendation, recommendationWorkspace, setRecommendationWorkspace, setTryOnWorkspace, session } = useAppContext()

  const planCode = session.user?.subscription_plan || 'free'
  const isSubscriptionExpired = session.user?.is_subscription_expired
  const occasionFilterAvailable = planCode === 'standard' || planCode === 'premium'
  const [showExpiryModal, setShowExpiryModal] = useState(false)

  const bottomItems = useMemo(() => data.wardrobe.filter((item) => item.type === 'bottom'), [data.wardrobe])
  const selectedBottomItem = useMemo(
    () => bottomItems.find((item) => item.id === recommendationWorkspace.form.bottom_item_id) || null,
    [bottomItems, recommendationWorkspace.form.bottom_item_id],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const remainingRecommendations = session.user?.remaining_recommendations_today
    if (remainingRecommendations !== null && remainingRecommendations !== undefined && remainingRecommendations <= 0) {
      setShowExpiryModal(true)
      return
    }

    await runRecommendation({
      bottom_item_id: recommendationWorkspace.form.bottom_item_id,
      occasion: occasionFilterAvailable ? recommendationWorkspace.form.occasion || null : null,
      suggestion_count: Number(recommendationWorkspace.form.suggestion_count),
    })
  }

  function handleTryOn(topItemId) {
    setTryOnWorkspace((current) => ({
      ...current,
      form: {
        ...current.form,
        top_item_id: topItemId,
      },
    }))
    setRouteHash('app', 'tryon')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Recommendation lab</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Build a run</h3>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <FieldLabel label="Bottom item">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              required
              value={recommendationWorkspace.form.bottom_item_id}
              onChange={(event) =>
                setRecommendationWorkspace((current) => ({
                  ...current,
                  form: {
                    ...current.form,
                    bottom_item_id: event.target.value,
                  },
                }))
              }
            >
              <option value="">Select a bottom</option>
              {bottomItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id.slice(0, 8)} | {formatDateTime(item.created_at)}
                </option>
              ))}
            </select>
          </FieldLabel>

          {selectedBottomItem ? (
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <img
                src={getMediaUrl(selectedBottomItem.image_url)}
                alt="Selected bottom for recommendation"
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-1 p-4">
                <p className="text-sm font-semibold text-stone-950">Selected bottom: {selectedBottomItem.id.slice(0, 8)}</p>
                <p className="text-xs text-stone-500">{formatDateTime(selectedBottomItem.created_at)}</p>
              </div>
            </div>
          ) : null}

          <FieldLabel label="Occasion">
            {occasionFilterAvailable ? (
              <select
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                value={recommendationWorkspace.form.occasion}
                onChange={(event) =>
                  setRecommendationWorkspace((current) => ({
                    ...current,
                    form: {
                      ...current.form,
                      occasion: event.target.value,
                    },
                  }))
                }
              >
                {occasionOptions.map((option) => (
                  <option key={option.value || 'none'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                Occasion-based recommendations are available only on Standard and Premium plans.
                Upgrade your plan to enable occasion selection.
              </div>
            )}
          </FieldLabel>

          <FieldLabel label="Number of suggestions">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              value={recommendationWorkspace.form.suggestion_count}
              onChange={(event) =>
                setRecommendationWorkspace((current) => ({
                  ...current,
                  form: {
                    ...current.form,
                    suggestion_count: Number(event.target.value),
                  },
                }))
              }
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </FieldLabel>

          <button
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={dashboardState.loading || isSubscriptionExpired}
          >
            Get recommendations
          </button>
          {isSubscriptionExpired ? (
            <p className="text-sm text-amber-700">Your subscription expired. Renew to use recommendations again.</p>
          ) : null}
        </form>
      </Panel>

      {showExpiryModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-stone-950">Upgrade required</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              {isSubscriptionExpired
                ? "Your plan has expired. Renew a subscription to continue using recommendations."
                : planCode === 'free'
                ? "You've used your free credits. Upgrade to a paid plan to continue using recommendations."
                : "You've reached your daily limit. Try again tomorrow or upgrade for higher limits."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126]"
                onClick={() => setRouteHash('app', 'activity')}
              >
                Go to plans
              </button>
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                onClick={() => setShowExpiryModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Results</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Top matches and history</h3>
        </div>

        {recommendationWorkspace.result ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendationWorkspace.result.results.map((item) => (
              <article key={item.top_item_id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <img src={getMediaUrl(item.top_item.image_url)} alt="Recommended top" className="aspect-square w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-stone-950">Score {item.score.toFixed(3)}</p>
                    <p className="text-xs text-stone-500">Top ID: {item.top_item_id}</p>
                  </div>
                  <button
                    className="w-full rounded-2xl bg-[#c65d2c] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#b65126]"
                    type="button"
                    onClick={() => handleTryOn(item.top_item_id)}
                  >
                    Try on this top
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-500">Run a recommendation to see ranked tops here.</p>
        )}

        <div className="mt-6 space-y-3">
          {data.recommendations.map((entry) => (
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
          {!data.recommendations.length ? <p className="text-sm text-stone-500">No recommendation history yet.</p> : null}
        </div>
      </Panel>
    </div>
  )
}
