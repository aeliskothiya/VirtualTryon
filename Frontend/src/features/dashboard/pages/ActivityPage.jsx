import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { Panel } from '../../../shared/ui/Panel'

export function ActivityPage() {
  const { data } = useAppContext()

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Pricing</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Feature costs</h3>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-[0.24em] text-stone-400">
              <tr>
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.pricing.map((item) => (
                <tr key={item.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 text-stone-700">{item.feature}</td>
                  <td className="px-4 py-3 text-stone-700">{item.coin_cost}</td>
                  <td className="px-4 py-3 text-stone-500">{formatDateTime(item.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Coin transactions</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Activity history</h3>
        </div>

        <div className="space-y-3">
          {data.transactions.map((item) => (
            <div key={item.id} className="rounded-3xl border border-stone-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-950">
                    {item.type} {item.amount > 0 ? `+${item.amount}` : item.amount}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">{item.reason}</p>
                </div>
                <span className="text-xs text-stone-400">{formatDateTime(item.created_at)}</span>
              </div>
            </div>
          ))}
          {!data.transactions.length ? <p className="text-sm text-stone-500">No transactions yet.</p> : null}
        </div>
      </Panel>
    </div>
  )
}
