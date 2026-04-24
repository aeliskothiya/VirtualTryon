import { useMemo, useState } from 'react'
import { useAppContext } from '../../app/AppContext'
import { getMediaUrl } from '../../shared/api/client'
import { formatDateTime } from '../../shared/format'

const completionDefaults = {
  gender_preference: 'female',
  photo: null,
}

const passwordDefaults = {
  current_password: '',
  new_password: '',
  confirm_new_password: '',
}

const wardrobeDefaults = {
  type: 'top',
  files: [],
}

const recommendationDefaults = {
  bottom_item_id: '',
  occasion: '',
  suggestion_count: 5,
}

const occasionOptions = [
  { value: '', label: 'No occasion filter' },
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'party', label: 'Party' },
  { value: 'sport', label: 'Sport' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'formal', label: 'Formal' },
]

const tryOnDefaults = {
  top_item_id: '',
  override_photo: null,
}

export function DashboardScreen() {
  const {
    addWardrobeItem,
    addWardrobeItems,
    changePassword,
    clearNotice,
    completeProfile,
    dashboardState,
    data,
    logout,
    notice,
    removeWardrobeItem,
    runWardrobeEmbeddingSync,
    runRecommendation,
    runTryOn,
    saveProfile,
    saveProfilePhoto,
    session,
  } = useAppContext()
  const [completionForm, setCompletionForm] = useState(completionDefaults)
  const [profileForm, setProfileForm] = useState(() => ({
    name: session.user?.name ?? '',
    gender_preference: session.user?.gender_preference ?? 'female',
  }))
  const [passwordForm, setPasswordForm] = useState(passwordDefaults)
  const [wardrobeForm, setWardrobeForm] = useState(wardrobeDefaults)
  const [recommendationForm, setRecommendationForm] = useState(recommendationDefaults)
  const [recommendationResult, setRecommendationResult] = useState(null)
  const [tryOnForm, setTryOnForm] = useState(tryOnDefaults)
  const [tryOnResult, setTryOnResult] = useState(null)

  const topItems = useMemo(
    () => data.wardrobe.filter((item) => item.type === 'top'),
    [data.wardrobe],
  )
  const bottomItems = useMemo(
    () => data.wardrobe.filter((item) => item.type === 'bottom'),
    [data.wardrobe],
  )
  const selectedBottomItem = useMemo(
    () => bottomItems.find((item) => item.id === recommendationForm.bottom_item_id) || null,
    [bottomItems, recommendationForm.bottom_item_id],
  )

  async function handleCompleteProfile(event) {
    event.preventDefault()
    await completeProfile(completionForm)
    setCompletionForm(completionDefaults)
    setProfileForm({
      name: session.user?.name ?? '',
      gender_preference: completionForm.gender_preference,
    })
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    await saveProfile(profileForm)
  }

  async function handlePhotoSubmit(event) {
    event.preventDefault()
    const file = event.target.elements.profilePhoto.files?.[0]
    if (!file) {
      return
    }
    await saveProfilePhoto(file)
    event.target.reset()
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    await changePassword(passwordForm)
    setPasswordForm(passwordDefaults)
  }

  async function handleWardrobeSubmit(event) {
    event.preventDefault()

    if (!wardrobeForm.files.length) {
      return
    }

    if (wardrobeForm.files.length === 1) {
      await addWardrobeItem({
        type: wardrobeForm.type,
        file: wardrobeForm.files[0],
      })
    } else {
      await addWardrobeItems({
        type: wardrobeForm.type,
        files: wardrobeForm.files,
      })
    }

    setWardrobeForm(wardrobeDefaults)
    event.target.reset()
  }

  async function handleRecommendationSubmit(event) {
    event.preventDefault()
    const result = await runRecommendation({
      bottom_item_id: recommendationForm.bottom_item_id,
      occasion: recommendationForm.occasion || null,
      suggestion_count: Number(recommendationForm.suggestion_count),
    })
    setRecommendationResult(result)
  }

  async function handleTryOnSubmit(event) {
    event.preventDefault()
    const result = await runTryOn(tryOnForm)
    setTryOnResult(result)
    setTryOnForm((current) => ({ ...current, override_photo: null }))
    event.target.reset()
  }

  const user = session.user

  return (
    <main className="dashboard-layout">
      <section className="dashboard-hero">
        <div>
          <div className="eyebrow">Connected workspace</div>
          <h1>{user?.is_fully_registered ? 'Your styling control room' : 'Finish setup'}</h1>
          <p className="hero-copy">
            Manage profile data, wardrobe uploads, recommendations, try-on jobs, pricing, and coin
            usage from one React dashboard backed by your APIs.
          </p>
        </div>

        <div className="hero-actions">
          <div className="summary-chip">
            <span>Coins</span>
            <strong>{user?.coin_balance ?? 0}</strong>
          </div>
          <div className="summary-chip">
            <span>Status</span>
            <strong>{user?.is_fully_registered ? 'Ready' : 'Step 2 pending'}</strong>
          </div>
          <button className="ghost-button" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </section>

      {notice ? (
        <div className="message success" onClick={clearNotice} role="status">
          {notice}
        </div>
      ) : null}
      {dashboardState.error ? <div className="message error">{dashboardState.error}</div> : null}
      {dashboardState.loading ? <div className="message info">Syncing with backend...</div> : null}

      {!user?.is_fully_registered ? (
        <section className="card">
          <h2>Registration step 2</h2>
          <p className="muted">Upload a profile photo and choose gender preference.</p>
          <form className="stack-form" onSubmit={handleCompleteProfile}>
            <label>
              Gender preference
              <select
                value={completionForm.gender_preference}
                onChange={(event) =>
                  setCompletionForm((current) => ({
                    ...current,
                    gender_preference: event.target.value,
                  }))
                }
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Profile photo
              <input
                required
                type="file"
                accept="image/*"
                onChange={(event) =>
                  setCompletionForm((current) => ({
                    ...current,
                    photo: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </label>
            <button className="primary-button" type="submit" disabled={dashboardState.loading}>
              Complete registration
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="grid two-up">
            <article className="card profile-card">
              <div className="section-heading">
                <div>
                  <h2>Profile</h2>
                  <p className="muted">Update public details and login credentials.</p>
                </div>
                {user?.profile_photo_url ? (
                  <img
                    className="avatar"
                    src={getMediaUrl(user.profile_photo_url)}
                    alt={user.name}
                  />
                ) : null}
              </div>

              <form className="stack-form" onSubmit={handleProfileSubmit}>
                <label>
                  Name
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Gender preference
                  <select
                    value={profileForm.gender_preference}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        gender_preference: event.target.value,
                      }))
                    }
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <button className="primary-button" type="submit" disabled={dashboardState.loading}>
                  Save profile
                </button>
              </form>

              <form className="stack-form" onSubmit={handlePhotoSubmit}>
                <label>
                  Replace profile photo
                  <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" />
                </label>
                <button className="ghost-button" type="submit" disabled={dashboardState.loading}>
                  Upload photo
                </button>
              </form>

              <form className="stack-form" onSubmit={handlePasswordSubmit}>
                <label>
                  Current password
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        current_password: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        new_password: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={passwordForm.confirm_new_password}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        confirm_new_password: event.target.value,
                      }))
                    }
                  />
                </label>
                <button className="ghost-button" type="submit" disabled={dashboardState.loading}>
                  Change password
                </button>
              </form>
            </article>

            <article className="card">
              <h2>Coins and pricing</h2>
              <p className="muted">Feature pricing comes from `/pricing`, usage history from coin transactions.</p>
              <div className="mini-stats">
                <div className="stat-block">
                  <span>Balance</span>
                  <strong>{user?.coin_balance ?? 0}</strong>
                </div>
                <div className="stat-block">
                  <span>Transactions</span>
                  <strong>{data.transactions.length}</strong>
                </div>
                <div className="stat-block">
                  <span>Wardrobe items</span>
                  <strong>{data.wardrobe.length}</strong>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Cost</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pricing.map((item) => (
                      <tr key={item.id}>
                        <td>{item.feature}</td>
                        <td>{item.coin_cost}</td>
                        <td>{formatDateTime(item.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <section className="grid two-up">
            <article className="card">
              <h2>Wardrobe</h2>
              <p className="muted">Upload tops and bottoms with the multipart API used by the backend.</p>
              <button
                className="ghost-button"
                type="button"
                onClick={() => runWardrobeEmbeddingSync()}
                disabled={dashboardState.loading}
              >
                Sync missing embeddings
              </button>
              <form className="stack-form" onSubmit={handleWardrobeSubmit}>
                <label>
                  Item type
                  <select
                    value={wardrobeForm.type}
                    onChange={(event) =>
                      setWardrobeForm((current) => ({ ...current, type: event.target.value }))
                    }
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </label>
                <label>
                  Clothing image(s)
                  <input
                    required
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      setWardrobeForm((current) => ({
                        ...current,
                        files: event.target.files ? Array.from(event.target.files) : [],
                      }))
                    }
                  />
                </label>
                <button className="primary-button" type="submit" disabled={dashboardState.loading}>
                  Upload item
                </button>
              </form>

              <div className="item-grid">
                {data.wardrobe.map((item) => (
                  <article className="wardrobe-card" key={item.id}>
                    <img src={getMediaUrl(item.image_url)} alt={`${item.type} item`} />
                    <div>
                      <strong>{item.type}</strong>
                      <p className="muted">{formatDateTime(item.created_at)}</p>
                      <p className={item.embedding_done ? 'status-ok' : 'status-warn'}>
                        {item.embedding_done ? 'Embedding ready' : 'Embedding pending'}
                      </p>
                      {!item.embedding_done && item.embedding_error ? (
                        <p className="muted">{item.embedding_error}</p>
                      ) : null}
                    </div>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => removeWardrobeItem(item.id)}
                    >
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            </article>

            <article className="card">
              <h2>Recommendations</h2>
              <p className="muted">Choose a bottom item and get ranked matching tops.</p>
              <form className="stack-form" onSubmit={handleRecommendationSubmit}>
                <label>
                  Bottom item
                  <select
                    required
                    value={recommendationForm.bottom_item_id}
                    onChange={(event) =>
                      setRecommendationForm((current) => ({
                        ...current,
                        bottom_item_id: event.target.value,
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
                </label>

                {selectedBottomItem ? (
                  <div className="preview-panel">
                    <img
                      src={getMediaUrl(selectedBottomItem.image_url)}
                      alt="Selected bottom for recommendation"
                    />
                    <p className="muted">Selected bottom: {selectedBottomItem.id.slice(0, 8)}</p>
                    <p className="muted">{formatDateTime(selectedBottomItem.created_at)}</p>
                  </div>
                ) : null}

                <label>
                  Occasion
                  <select
                    value={recommendationForm.occasion}
                    onChange={(event) =>
                      setRecommendationForm((current) => ({
                        ...current,
                        occasion: event.target.value,
                      }))
                    }
                  >
                    {occasionOptions.map((option) => (
                      <option key={option.value || 'none'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Number of suggestions
                  <select
                    value={recommendationForm.suggestion_count}
                    onChange={(event) =>
                      setRecommendationForm((current) => ({
                        ...current,
                        suggestion_count: Number(event.target.value),
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="primary-button" type="submit" disabled={dashboardState.loading}>
                  Get recommendations
                </button>
              </form>

              {recommendationResult ? (
                <div className="results-grid">
                  {recommendationResult.results.map((result) => (
                    <article className="result-card" key={result.top_item_id}>
                      <img src={getMediaUrl(result.top_item.image_url)} alt="Recommended top" />
                      <div>
                        <strong>Score {result.score.toFixed(3)}</strong>
                        <p className="muted">Top ID: {result.top_item_id}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="history-list">
                {data.recommendations.map((entry) => (
                  <div className="history-item" key={entry.id}>
                    <strong>{entry.suggested_top_ids.length} suggestions</strong>
                    <span>{entry.occasion || 'No occasion'}</span>
                    <span>{formatDateTime(entry.created_at)}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid two-up">
            <article className="card">
              <h2>Virtual try-on</h2>
              <p className="muted">Choose a top and optionally override the stored profile photo.</p>
              <form className="stack-form" onSubmit={handleTryOnSubmit}>
                <label>
                  Top item
                  <select
                    required
                    value={tryOnForm.top_item_id}
                    onChange={(event) =>
                      setTryOnForm((current) => ({ ...current, top_item_id: event.target.value }))
                    }
                  >
                    <option value="">Select a top</option>
                    {topItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.id.slice(0, 8)} | {formatDateTime(item.created_at)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Override photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setTryOnForm((current) => ({
                        ...current,
                        override_photo: event.target.files?.[0] ?? null,
                      }))
                    }
                  />
                </label>
                <button className="primary-button" type="submit" disabled={dashboardState.loading}>
                  Run try-on
                </button>
              </form>

              {tryOnResult?.output_url ? (
                <div className="preview-panel">
                  <img src={getMediaUrl(tryOnResult.output_url)} alt="Try-on output" />
                </div>
              ) : null}
            </article>

            <article className="card">
              <h2>Activity</h2>
              <p className="muted">Recent try-on jobs and coin movements.</p>
              <div className="history-list">
                {data.tryons.map((item) => (
                  <div className="history-item" key={item.id}>
                    <strong>{item.status}</strong>
                    <span>{item.input_photo_used} photo</span>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                ))}
              </div>
              <div className="history-list">
                {data.transactions.map((item) => (
                  <div className="history-item" key={item.id}>
                    <strong>
                      {item.type} {item.amount > 0 ? `+${item.amount}` : item.amount}
                    </strong>
                    <span>{item.reason}</span>
                    <span>{formatDateTime(item.created_at)}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  )
}
