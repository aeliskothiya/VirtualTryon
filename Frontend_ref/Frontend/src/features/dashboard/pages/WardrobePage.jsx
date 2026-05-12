import { useEffect, useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { getMediaUrl, getWardrobeItems, updateWardrobeItemStatus } from '../../../shared/api/client'
import { FieldLabel, InputShell } from '../../../shared/ui/Field'
import { Panel } from '../../../shared/ui/Panel'

const wardrobeDefaults = {
  type: 'top',
  files: [],
}

export function WardrobePage() {
  const {
    addWardrobeItem,
    addWardrobeItems,
    dashboardState,
    data,
    removeWardrobeItem,
    runWardrobeEmbeddingSync,
    session,
  } = useAppContext()
  const [wardrobeForm, setWardrobeForm] = useState(wardrobeDefaults)
  const [wardrobeItems, setWardrobeItems] = useState(data.wardrobe)
  const [wardrobeLoading, setWardrobeLoading] = useState(false)
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null)

  async function refreshWardrobeItems() {
    if (!session?.token) {
      return
    }

    setWardrobeLoading(true)

    try {
      const items = await getWardrobeItems(session.token, true)
      setWardrobeItems(items)
    } catch {
      setWardrobeItems(data.wardrobe)
    } finally {
      setWardrobeLoading(false)
    }
  }

  useEffect(() => {
    refreshWardrobeItems()
  }, [session?.token, data.wardrobe])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!wardrobeForm.files.length) {
      return
    }

    if (wardrobeForm.files.length === 1) {
      await addWardrobeItem({ type: wardrobeForm.type, file: wardrobeForm.files[0] })
    } else {
      await addWardrobeItems({ type: wardrobeForm.type, files: wardrobeForm.files })
    }

    await refreshWardrobeItems()
    setWardrobeForm(wardrobeDefaults)
    event.target.reset()
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.active_status === 'active' ? 'inactive' : 'active'
    await updateWardrobeItemStatus(session.token, item.id, nextStatus)
    await refreshWardrobeItems()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Wardrobe library</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Upload items</h3>
        </div>

        <button
          className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={() => runWardrobeEmbeddingSync()}
          disabled={dashboardState.loading}
        >
          Sync missing embeddings
        </button>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <FieldLabel label="Item type">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              value={wardrobeForm.type}
              onChange={(event) => setWardrobeForm((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </FieldLabel>

          <FieldLabel label="Clothing image(s)">
            <InputShell>
              <input
                required
                type="file"
                accept="image/*"
                multiple
                className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#c65d2c] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#b65126]"
                onChange={(event) =>
                  setWardrobeForm((current) => ({
                    ...current,
                    files: event.target.files ? Array.from(event.target.files) : [],
                  }))
                }
              />
            </InputShell>
          </FieldLabel>

          <button className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={dashboardState.loading}>
            Upload item
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Inventory</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Saved wardrobe items</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {wardrobeItems.map((item) => (
            <article
              key={item.id}
              className={`overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm ${
                item.active_status === 'inactive' ? 'opacity-70' : ''
              }`}
            >
              <img src={getMediaUrl(item.image_url)} alt={`${item.type} item`} className="aspect-square w-full object-cover" />
              <div className="space-y-3 p-4">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-stone-950">{item.type}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] ${
                        item.active_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.active_status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-500">{formatDateTime(item.created_at)}</p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${item.embedding_done ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {item.embedding_done ? 'Embedding ready' : 'Embedding pending'}
                  </p>
                  {!item.embedding_done && item.embedding_error ? (
                    <p className="mt-1 text-xs leading-5 text-stone-500">{item.embedding_error}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                  >
                    {item.active_status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  {item.delete_status === 'active' ? (
                    <button
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                      type="button"
                      onClick={() => setConfirmDeleteItem(item)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          {!wardrobeItems.length && !wardrobeLoading ? (
            <p className="text-sm text-stone-500">No wardrobe items yet.</p>
          ) : null}
          {wardrobeLoading ? <p className="text-sm text-stone-500">Loading wardrobe items...</p> : null}
        </div>
      </Panel>

      {confirmDeleteItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-stone-950">Delete wardrobe item</h3>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Are you sure you want to delete this item from your wardrobe? This action will remove it from your wardrobe.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b65126]"
                onClick={async () => {
                  await removeWardrobeItem(confirmDeleteItem.id)
                  refreshWardrobeItems()
                  setConfirmDeleteItem(null)
                }}
              >
                Delete item
              </button>
              <button
                type="button"
                className="inline-flex min-w-[150px] items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                onClick={() => setConfirmDeleteItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
