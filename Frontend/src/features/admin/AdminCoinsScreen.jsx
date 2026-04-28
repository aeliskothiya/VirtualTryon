import { useEffect, useState } from 'react'
import { useAppContext } from '../../app/AppContext'
import { FieldLabel } from '../../shared/ui/Field'
import { Panel } from '../../shared/ui/Panel'

const packageDefaults = {
  code: '',
  title: '',
  coin_amount: 100,
  price_label: '$0.00',
  description: '',
  bonus_coins: 0,
  is_active: true,
}

const pricingLabels = {
  tryon: 'Try-on',
  recommendation: 'Recommendation',
}

export function AdminCoinsScreen({ onNavigate }) {
  const {
    adminPricing,
    coinPackages,
    dashboardState,
    logout,
    removeCoinPackage,
    saveAdminPricing,
    saveCoinPackage,
    session,
  } = useAppContext()
  const admin = session.user
  const [pricingForm, setPricingForm] = useState({ tryon: 5, recommendation: 3 })
  const [packageForm, setPackageForm] = useState(packageDefaults)

  useEffect(() => {
    const pricingMap = Object.fromEntries(adminPricing.map((item) => [item.feature, item.coin_cost]))
    setPricingForm({
      tryon: pricingMap.tryon ?? 5,
      recommendation: pricingMap.recommendation ?? 3,
    })
  }, [adminPricing])

  async function handlePricingSubmit(feature) {
    await saveAdminPricing(feature, { coin_cost: Number(pricingForm[feature]) })
  }

  async function handlePackageSubmit(event) {
    event.preventDefault()
    await saveCoinPackage({
      ...packageForm,
      coin_amount: Number(packageForm.coin_amount),
      bonus_coins: Number(packageForm.bonus_coins),
    })
    setPackageForm(packageDefaults)
  }

  function editPackage(item) {
    setPackageForm({
      code: item.code,
      title: item.title,
      coin_amount: item.coin_amount,
      price_label: item.price_label,
      description: item.description || '',
      bonus_coins: item.bonus_coins || 0,
      is_active: Boolean(item.is_active),
    })
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-4 lg:px-6 xl:px-8">
      <section className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8d401d]">
              Coins & Premiums
            </span>
            <h1 className="font-serif text-4xl tracking-tight text-stone-950">Pricing and package setup</h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-500">
              Adjust feature coin costs and manage the premium packs users can buy.
            </p>
          </div>

          <div className="w-full max-w-sm">
            <Panel>
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-stone-400">Signed in as</p>
              <p className="mt-2 text-xl font-semibold text-stone-950">{admin?.name}</p>
              <p className="mt-1 text-sm text-stone-500">{admin?.email}</p>
              <div className="mt-4 grid gap-3">
                <button
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                  type="button"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Back to dashboard
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

        {dashboardState.error ? (
          <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {dashboardState.error}
          </div>
        ) : null}
        {dashboardState.loading ? (
          <div className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 shadow-sm">
            Syncing coin settings...
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel>
            <div className="mb-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Coin usage</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Feature pricing</h2>
              <p className="mt-2 text-sm text-stone-500">
                Update the coin cost for the user-facing try-on and recommendation features.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(pricingLabels).map(([feature, label]) => {
                const current = adminPricing.find((item) => item.feature === feature)
                return (
                  <div key={feature} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-stone-950">{label}</p>
                        <p className="text-xs text-stone-500">
                          Current price: {current?.coin_cost ?? pricingForm[feature]} coins
                        </p>
                      </div>
                      <div className="flex gap-3 md:min-w-[320px]">
                        <FieldLabel label="Coins">
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                            value={pricingForm[feature]}
                            onChange={(event) =>
                              setPricingForm((current) => ({
                                ...current,
                                [feature]: event.target.value,
                              }))
                            }
                          />
                        </FieldLabel>
                        <button
                          className="h-[56px] self-end rounded-2xl bg-[#c65d2c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          disabled={dashboardState.loading}
                          onClick={() => handlePricingSubmit(feature)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel>
            <div className="mb-4">
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Premium bundles</p>
              <h2 className="mt-2 font-serif text-3xl text-stone-950">Coin packages</h2>
              <p className="mt-2 text-sm text-stone-500">
                Create and maintain the premium packs users can purchase.
              </p>
            </div>

            <form className="grid gap-4" onSubmit={handlePackageSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldLabel label="Code">
                  <input
                    required
                    value={packageForm.code}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, code: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                  />
                </FieldLabel>
                <FieldLabel label="Title">
                  <input
                    required
                    value={packageForm.title}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, title: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                  />
                </FieldLabel>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FieldLabel label="Coins">
                  <input
                    type="number"
                    min="1"
                    required
                    value={packageForm.coin_amount}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, coin_amount: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                  />
                </FieldLabel>
                <FieldLabel label="Price label">
                  <input
                    required
                    value={packageForm.price_label}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, price_label: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                  />
                </FieldLabel>
                <FieldLabel label="Bonus coins">
                  <input
                    type="number"
                    min="0"
                    value={packageForm.bonus_coins}
                    onChange={(event) =>
                      setPackageForm((current) => ({ ...current, bonus_coins: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                  />
                </FieldLabel>
              </div>

              <FieldLabel label="Description">
                <textarea
                  rows={3}
                  value={packageForm.description}
                  onChange={(event) =>
                    setPackageForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
                />
              </FieldLabel>

              <label className="flex items-center gap-3 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={packageForm.is_active}
                  onChange={(event) =>
                    setPackageForm((current) => ({ ...current, is_active: event.target.checked }))
                  }
                />
                Active package
              </label>

              <button
                className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={dashboardState.loading}
              >
                Save package
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {coinPackages.map((item) => (
                <article key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-stone-950">{item.title}</p>
                      <p className="mt-1 text-xs text-stone-500">
                        {item.code} | {item.coin_amount} coins | {item.price_label}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        Bonus: {item.bonus_coins} | {item.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
                        type="button"
                        onClick={() => editPackage(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        type="button"
                        onClick={() => removeCoinPackage(item.code)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {item.description ? <p className="mt-2 text-xs leading-5 text-stone-500">{item.description}</p> : null}
                </article>
              ))}
              {!coinPackages.length ? <p className="text-sm text-stone-500">No coin packages yet.</p> : null}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  )
}
