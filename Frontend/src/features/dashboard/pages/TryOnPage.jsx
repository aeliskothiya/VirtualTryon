import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { getMediaUrl } from '../../../shared/api/client'
import { FieldLabel, InputShell } from '../../../shared/ui/Field'
import { Panel } from '../../../shared/ui/Panel'

export function TryOnPage() {
  const { dashboardState, data, runTryOn, tryOnWorkspace, setTryOnWorkspace } = useAppContext()

  const topItems = data.wardrobe.filter((item) => item.type === 'top')
  const selectedTopItem = topItems.find((item) => item.id === tryOnWorkspace.form.top_item_id) || null

  async function handleSubmit(event) {
    event.preventDefault()
    await runTryOn(tryOnWorkspace.form)
    setTryOnWorkspace((current) => ({
      ...current,
      form: {
        ...current.form,
        override_photo: null,
      },
    }))
    event.target.reset()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Virtual try-on</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Generate a look</h3>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <FieldLabel label="Top item">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              required
              value={tryOnWorkspace.form.top_item_id}
              onChange={(event) =>
                setTryOnWorkspace((current) => ({
                  ...current,
                  form: {
                    ...current.form,
                    top_item_id: event.target.value,
                  },
                }))
              }
            >
              <option value="">Select a top</option>
              {topItems.map((item) => (
                <option key={item.id} value={item.id}>
                  Top {item.id.slice(0, 8)} | {formatDateTime(item.created_at)}
                </option>
              ))}
            </select>
          </FieldLabel>

          {selectedTopItem ? (
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <img
                src={getMediaUrl(selectedTopItem.image_url)}
                alt="Selected top preview"
                className="aspect-square w-full object-cover"
              />
              <div className="space-y-1 p-4">
                <p className="text-sm font-semibold text-stone-950">Selected top: {selectedTopItem.id.slice(0, 8)}</p>
                <p className="text-xs text-stone-500">{formatDateTime(selectedTopItem.created_at)}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-4 text-sm text-stone-500">
              Choose a top to see its image preview here.
            </div>
          )}

          <FieldLabel label="Override photo">
            <InputShell>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800"
                onChange={(event) =>
                  setTryOnWorkspace((current) => ({
                    ...current,
                    form: {
                      ...current.form,
                      override_photo: event.target.files?.[0] ?? null,
                    },
                  }))
                }
              />
            </InputShell>
          </FieldLabel>

          <button className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={dashboardState.loading}>
            Run try-on
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Output</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Latest generated look</h3>
        </div>

        {tryOnWorkspace.result?.output_url ? (
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <img
              src={getMediaUrl(tryOnWorkspace.result.output_url)}
              alt="Try-on output"
              className="w-full object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-stone-500">No try-on preview yet.</p>
        )}

        <div className="mt-6 space-y-3">
          {data.tryons.map((item) => (
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
    </div>
  )
}
