import { useAppContext } from '../../app/AppContext'
import { MetricCard } from '../../shared/ui/MetricCard'
import { Panel } from '../../shared/ui/Panel'
import { getAdminPlans, createAdminPlan, updateAdminPlan } from '../../shared/api/client'
import { useState } from 'react'

export function AdminPlansScreen({ onNavigate }) {
  const { adminOverview, logout, session, subscriptionPlans } = useAppContext()
  const admin = session.user
  const [plans, setPlans] = useState(subscriptionPlans || [])
  const [newPlan, setNewPlan] = useState({ code: '', name: '', wardrobe_limit: 5, tryon_daily_limit: 1 })
  const [editingPlan, setEditingPlan] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [toggleConfirm, setToggleConfirm] = useState(null)

  async function refresh() {
    try {
      const res = await getAdminPlans(session.token)
      setPlans(res)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createAdminPlan(session.token, newPlan)
      setNewPlan({ code: '', name: '', wardrobe_limit: 5, tryon_daily_limit: 1 })
      setCreating(false)
      await refresh()
    } catch (err) {
      alert(err.message || 'Failed')
    }
  }

  function askToggleActive(plan) {
    setToggleConfirm(plan)
  }

  async function confirmToggleActive() {
    if (!toggleConfirm) return
    try {
      await updateAdminPlan(session.token, toggleConfirm.code, { active: !toggleConfirm.active })
      setToggleConfirm(null)
      await refresh()
    } catch (err) {
      alert(err.message || 'Failed to toggle')
      setToggleConfirm(null)
    }
  }

  function openEdit(plan) {
    setEditingPlan(plan.code)
    setEditForm({
      name: plan.name,
      description: plan.description || '',
      wardrobe_limit: plan.wardrobe_limit,
      tryon_daily_limit: plan.tryon_daily_limit,
      recommendation_daily_limit: plan.recommendation_daily_limit,
      saved_tryon_monthly_limit: plan.saved_tryon_monthly_limit,
      is_default: plan.is_default,
    })
  }

  async function saveEdit(e) {
    e.preventDefault()
    try {
      await updateAdminPlan(session.token, editingPlan, editForm)
      setEditingPlan(null)
      await refresh()
    } catch (err) {
      alert(err.message || 'Failed to save')
    }
  }

  const metrics = [
    { label: 'Users', value: adminOverview?.total_users ?? 0, detail: 'Total registered users' },
    { label: 'Registered', value: adminOverview?.fully_registered_users ?? 0, detail: 'Completed step 2' },
    { label: 'Admins', value: adminOverview?.total_admins ?? 0, detail: 'Admin accounts' },
    { label: 'Try-ons', value: adminOverview?.total_tryons ?? 0, detail: 'Generated jobs' },
    { label: 'Recommendations', value: adminOverview?.total_recommendations ?? 0, detail: 'Generated runs' },
    { label: 'Saved try-ons', value: adminOverview?.total_saved_tryons ?? 0, detail: 'Saved outputs this month' },
    { label: 'Plans', value: plans.length, detail: 'Available subscription tiers' },
  ]

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] px-4 py-4 lg:px-6 xl:px-8">
      <section className="rounded-[32px] border border-stone-200 bg-stone-50/90 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-[#c65d2c]/10 px-4 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8d401d]">
              Subscription plans
            </span>
            <h1 className="font-serif text-4xl tracking-tight text-stone-950">Plan setup</h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-500">
              Review the fixed tier limits that control wardrobe space, try-on usage, and saved output quotas.
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="mt-6">
          <form onSubmit={handleCreate} className="mb-4 flex gap-2">
            <input required placeholder="code" value={newPlan.code} onChange={(e)=>setNewPlan({...newPlan, code:e.target.value})} className="rounded px-3 py-2" />
            <input required placeholder="name" value={newPlan.name} onChange={(e)=>setNewPlan({...newPlan, name:e.target.value})} className="rounded px-3 py-2" />
            <input type="number" placeholder="wardrobe_limit" value={newPlan.wardrobe_limit} onChange={(e)=>setNewPlan({...newPlan, wardrobe_limit: parseInt(e.target.value||0)})} className="rounded px-3 py-2 w-36" />
            <input type="number" placeholder="tryon_daily_limit" value={newPlan.tryon_daily_limit} onChange={(e)=>setNewPlan({...newPlan, tryon_daily_limit: parseInt(e.target.value||0)})} className="rounded px-3 py-2 w-36" />
            <button className="rounded bg-emerald-600 text-white px-4" type="submit">Add plan</button>
            <button type="button" onClick={refresh} className="rounded border px-3">Refresh</button>
          </form>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {plans.map((plan) => (
            <Panel key={plan.code}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">{plan.code}</p>
                    <h2 className="mt-2 font-serif text-3xl text-stone-950">{plan.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.is_default ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Default
                    </span>
                    ) : null}
                    {plan.active ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      ✓ Active
                    </span>
                    ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      ✗ Inactive
                    </span>
                    )}
                    <button onClick={()=>askToggleActive(plan)} className="rounded px-3 py-1 border font-medium">
                      {plan.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={()=>openEdit(plan)} disabled={!plan.active} className={`rounded px-3 py-1 border ${plan.active ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 cursor-not-allowed opacity-50'}`}>Edit</button>
                  </div>
                </div>

                <p className="text-sm leading-7 text-stone-500">{plan.description}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Wardrobe</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">{plan.wardrobe_limit} items</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Try-on</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">{plan.tryon_daily_limit} per day</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Recommendations</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      {plan.recommendation_daily_limit === null ? 'Unlimited' : `${plan.recommendation_daily_limit} per day`}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Saved try-ons</p>
                    <p className="mt-2 text-lg font-semibold text-stone-950">
                      {plan.saved_tryon_monthly_limit === 0 ? 'Preview only' : `${plan.saved_tryon_monthly_limit} per month`}
                    </p>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {editingPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Panel className="w-full max-w-md">
              <h2 className="font-serif text-2xl mb-4">Edit Plan: {editingPlan}</h2>
              <form onSubmit={saveEdit} className="space-y-3">
                <div>
                  <label className="text-xs uppercase">Name</label>
                  <input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full rounded border px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs uppercase">Description</label>
                  <input type="text" value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} className="w-full rounded border px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs uppercase">Wardrobe Limit</label>
                    <input type="number" value={editForm.wardrobe_limit} onChange={(e)=>setEditForm({...editForm, wardrobe_limit: parseInt(e.target.value||0)})} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-xs uppercase">Try-on Daily</label>
                    <input type="number" value={editForm.tryon_daily_limit} onChange={(e)=>setEditForm({...editForm, tryon_daily_limit: parseInt(e.target.value||0)})} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs uppercase">Recommendations</label>
                    <input type="number" value={editForm.recommendation_daily_limit ?? ''} onChange={(e)=>setEditForm({...editForm, recommendation_daily_limit: e.target.value === '' ? null : parseInt(e.target.value||0)})} className="w-full rounded border px-3 py-2" />
                  </div>
                  <div>
                    <label className="text-xs uppercase">Saved Try-ons/Month</label>
                    <input type="number" value={editForm.saved_tryon_monthly_limit} onChange={(e)=>setEditForm({...editForm, saved_tryon_monthly_limit: parseInt(e.target.value||0)})} className="w-full rounded border px-3 py-2" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-1 rounded bg-emerald-600 text-white px-4 py-2">Save</button>
                  <button type="button" onClick={()=>setEditingPlan(null)} className="flex-1 rounded border px-4 py-2">Cancel</button>
                </div>
              </form>
            </Panel>
          </div>
        )}

        {toggleConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Panel className="w-full max-w-md">
              <h2 className="font-serif text-2xl mb-4">
                {toggleConfirm.active ? 'Deactivate' : 'Activate'} Plan
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                {toggleConfirm.active 
                  ? `Are you sure you want to deactivate "${toggleConfirm.name}" plan? New users won't see this plan.` 
                  : `Are you sure you want to activate "${toggleConfirm.name}" plan? It will be available to new users.`}
              </p>
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={confirmToggleActive} 
                  className={`flex-1 rounded text-white px-4 py-2 ${toggleConfirm.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {toggleConfirm.active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={()=>setToggleConfirm(null)} 
                  className="flex-1 rounded border px-4 py-2 hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </Panel>
          </div>
        )}
      </section>
    </main>
  )
}