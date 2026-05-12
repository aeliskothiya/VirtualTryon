import { useState } from 'react'
import { useAppContext } from '../../../app/AppContext'
import { formatDateTime } from '../../../shared/format'
import { getMediaUrl } from '../../../shared/api/client'
import { FieldLabel, InputShell } from '../../../shared/ui/Field'
import { MetricCard } from '../../../shared/ui/MetricCard'
import { Panel } from '../../../shared/ui/Panel'

const completionDefaults = {
  gender_preference: 'female',
  photo: null,
}

const passwordDefaults = {
  current_password: '',
  new_password: '',
  confirm_new_password: '',
}

export function ProfilePage() {
  const { completeProfile, changePassword, dashboardState, saveProfile, saveProfilePhoto, session } = useAppContext()
  const user = session.user
  const [completionForm, setCompletionForm] = useState(completionDefaults)
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name ?? '',
    gender_preference: user?.gender_preference ?? 'female',
  }))
  const [passwordForm, setPasswordForm] = useState(passwordDefaults)

  async function handleCompleteProfile(event) {
    event.preventDefault()
    await completeProfile(completionForm)
    setCompletionForm(completionDefaults)
    setProfileForm((current) => ({ ...current, gender_preference: completionForm.gender_preference }))
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

  if (!user?.is_fully_registered) {
    return (
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Registration step 2</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Finish setup</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500">
            Upload a profile photo and choose gender preference to unlock the rest of the workspace.
          </p>
        </div>

        <form className="grid gap-4 lg:max-w-xl" onSubmit={handleCompleteProfile}>
          <FieldLabel label="Gender preference">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              value={completionForm.gender_preference}
              onChange={(event) =>
                setCompletionForm((current) => ({ ...current, gender_preference: event.target.value }))
              }
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </FieldLabel>

          <FieldLabel label="Profile photo">
            <InputShell>
              <input
                required
                type="file"
                accept="image/*"
                className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-[#c65d2c] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#b65126]"
                onChange={(event) =>
                  setCompletionForm((current) => ({
                    ...current,
                    photo: event.target.files?.[0] ?? null,
                  }))
                }
              />
            </InputShell>
          </FieldLabel>

          <button
            className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={dashboardState.loading}
          >
            Complete registration
          </button>
        </form>
      </Panel>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel>
        <div className="mb-6">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Profile studio</p>
          <h3 className="mt-2 font-serif text-3xl text-stone-950">Account details</h3>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-stone-200 bg-white p-4">
          {user?.profile_photo_url ? (
            <img className="h-16 w-16 rounded-2xl object-cover" src={getMediaUrl(user.profile_photo_url)} alt={user.name} />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c65d2c]/10 font-serif text-2xl text-[#8d401d]">
              {user?.name?.slice(0, 1) || 'F'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-stone-950">{user?.name}</p>
            <p className="mt-1 text-xs text-stone-500">{user?.email}</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit}>
          <FieldLabel label="Name">
            <input
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              value={profileForm.name}
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
            />
          </FieldLabel>

          <FieldLabel label="Gender preference">
            <select
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              value={profileForm.gender_preference}
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, gender_preference: event.target.value }))
              }
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </FieldLabel>

          <button className="rounded-2xl bg-[#c65d2c] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b65126] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={dashboardState.loading}>
            Save profile
          </button>
        </form>

        <form className="mt-6 grid gap-4" onSubmit={handlePhotoSubmit}>
          <FieldLabel label="Replace profile photo">
            <InputShell>
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-xl file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800"
              />
            </InputShell>
          </FieldLabel>
          <button className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={dashboardState.loading}>
            Upload photo
          </button>
        </form>

        <form className="mt-6 grid gap-4" onSubmit={handlePasswordSubmit}>
          <FieldLabel label="Current password">
            <input
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              type="password"
              value={passwordForm.current_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
              }
            />
          </FieldLabel>
          <FieldLabel label="New password">
            <input
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              type="password"
              value={passwordForm.new_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, new_password: event.target.value }))
              }
            />
          </FieldLabel>
          <FieldLabel label="Confirm new password">
            <input
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#c65d2c] focus:ring-4 focus:ring-[#c65d2c]/10"
              type="password"
              value={passwordForm.confirm_new_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, confirm_new_password: event.target.value }))
              }
            />
          </FieldLabel>
          <button className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={dashboardState.loading}>
            Change password
          </button>
        </form>
      </Panel>

      <Panel>
        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#8d401d]">Security snapshot</p>
        <h3 className="mt-2 font-serif text-3xl text-stone-950">Profile metadata</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <MetricCard label="Status" value={user?.is_fully_registered ? 'Active' : 'Pending'} detail="Account access" />
          <MetricCard label="Updated" value={formatDateTime(user?.updated_at)} detail="Last profile sync" />
          <MetricCard label="Joined" value={formatDateTime(user?.created_at)} detail="Account creation" />
        </div>
      </Panel>
    </div>
  )
}
