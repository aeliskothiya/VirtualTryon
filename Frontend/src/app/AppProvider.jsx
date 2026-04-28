import { useEffect, useState } from 'react'
import {
  deleteCoinPackage,
  getAdminOverview,
  getAdminPricing,
  completeRegistration,
  createTryOnJob,
  deleteWardrobeItem,
  getCoinTransactions,
  getMe,
  getCoinPackages,
  getPricing,
  getRecommendationHistory,
  getTryOnHistory,
  getWardrobeItems,
  loginAdmin,
  loginUser,
  recommendTops,
  registerStepOne,
  syncWardrobeEmbeddings,
  updatePassword,
  updateAdminPricing,
  updateProfile,
  upsertCoinPackage,
  uploadProfilePhoto,
  uploadWardrobeItem,
} from '../shared/api/client'
import { loadSession, saveSession } from '../shared/session'
import { AppContext } from './AppContext'

const defaultAsyncState = {
  loading: false,
  error: '',
}

const initialData = {
  pricing: [],
  coinPackages: [],
  transactions: [],
  wardrobe: [],
  recommendations: [],
  tryons: [],
  adminOverview: null,
}

const initialTryOnWorkspace = {
  form: {
    top_item_id: '',
    override_photo: null,
  },
  result: null,
}

const initialRecommendationWorkspace = {
  form: {
    bottom_item_id: '',
    occasion: '',
    suggestion_count: 5,
  },
  result: null,
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())
  const [data, setData] = useState(initialData)
  const [authState, setAuthState] = useState(defaultAsyncState)
  const [dashboardState, setDashboardState] = useState(defaultAsyncState)
  const [notice, setNotice] = useState('')
  const [tryOnWorkspace, setTryOnWorkspace] = useState(initialTryOnWorkspace)
  const [recommendationWorkspace, setRecommendationWorkspace] = useState(initialRecommendationWorkspace)

  useEffect(() => {
    saveSession(session)
  }, [session])

  useEffect(() => {
    if (!session.token) {
      return
    }

    if (session.kind === 'admin') {
      let active = true

      async function bootstrapAdmin() {
        setDashboardState({ loading: true, error: '' })

        try {
          const [overview, pricing, coinPackages] = await Promise.all([
            getAdminOverview(session.token),
            getAdminPricing(session.token),
            getCoinPackages(session.token),
          ])

          if (!active) {
            return
          }

          setData((current) => ({
            ...current,
            adminOverview: overview,
            pricing,
            coinPackages,
          }))
          setDashboardState({ loading: false, error: '' })
        } catch (error) {
          if (!active) {
            return
          }

          setDashboardState({ loading: false, error: error.message })
          if (error.status === 401) {
            logout()
          }
        }
      }

      bootstrapAdmin()

      return () => {
        active = false
      }
    }

    let active = true

    async function bootstrap() {
      setDashboardState({ loading: true, error: '' })

      try {
        const user = await getMe(session.token)

        if (!active) {
          return
        }

        setSession((current) => ({ ...current, user }))

        if (!user.is_fully_registered) {
          setDashboardState({ loading: false, error: '' })
          return
        }

        const [pricing, transactions, wardrobe, recommendations, tryons] = await Promise.all([
          getPricing(session.token),
          getCoinTransactions(session.token),
          getWardrobeItems(session.token),
          getRecommendationHistory(session.token),
          getTryOnHistory(session.token),
        ])

        if (!active) {
          return
        }

        setData({
          pricing,
          transactions,
          wardrobe,
          recommendations,
          tryons,
        })
        setDashboardState({ loading: false, error: '' })
      } catch (error) {
        if (!active) {
          return
        }

        setDashboardState({ loading: false, error: error.message })
        if (error.status === 401) {
          logout()
        }
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [session.kind, session.token])

  function clearNotice() {
    setNotice('')
  }

  function setSuccess(message) {
    setNotice(message)
  }

  async function refreshAdminWorkspace() {
    if (session.kind !== 'admin' || !session.token) {
      return
    }

    const [overview, pricing, coinPackages] = await Promise.all([
      getAdminOverview(session.token),
      getAdminPricing(session.token),
      getCoinPackages(session.token),
    ])

    setData((current) => ({
      ...current,
      adminOverview: overview,
      pricing,
      coinPackages,
    }))
  }

  function handleAuthFailureIfNeeded(error) {
    if (error?.status === 401) {
      logout()
      setDashboardState({ loading: false, error: 'Session expired. Please sign in again.' })
      return true
    }
    return false
  }

  function logout() {
    setSession({ kind: 'user', token: '', user: null })
    setData(initialData)
    setAuthState(defaultAsyncState)
    setDashboardState(defaultAsyncState)
    setNotice('')
    setTryOnWorkspace(initialTryOnWorkspace)
    setRecommendationWorkspace(initialRecommendationWorkspace)
  }

  async function runAuthAction(task, successMessage) {
    setAuthState({ loading: true, error: '' })
    clearNotice()

    try {
      const response = await task()
      setSession({ kind: 'user', token: response.access_token, user: response.user })
      setAuthState({ loading: false, error: '' })
      setSuccess(successMessage)
      return response
    } catch (error) {
      setAuthState({ loading: false, error: error.message })
      throw error
    }
  }

  async function handleRegister(payload) {
    return runAuthAction(
      () => registerStepOne(payload),
      'Account created. Finish step 2 to unlock wardrobe, recommendations, and try-on.',
    )
  }

  async function handleLogin(payload) {
    return runAuthAction(() => loginUser(payload), 'Welcome back.')
  }

  async function handleAdminLogin(payload) {
    setAuthState({ loading: true, error: '' })
    clearNotice()

    try {
      const response = await loginAdmin(payload)
      setSession({ kind: 'admin', token: response.access_token, user: response.admin })
      setAuthState({ loading: false, error: '' })
      setSuccess('Admin session started.')
      return response
    } catch (error) {
      setAuthState({ loading: false, error: error.message })
      throw error
    }
  }

  async function saveAdminPricing(feature, payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      await updateAdminPricing(session.token, feature, payload)
      await refreshAdminWorkspace()
      setDashboardState({ loading: false, error: '' })
      setSuccess(`${feature} pricing updated.`)
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function saveCoinPackage(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      await upsertCoinPackage(session.token, payload)
      await refreshAdminWorkspace()
      setDashboardState({ loading: false, error: '' })
      setSuccess(`Coin package ${payload.code} saved.`)
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function removeCoinPackage(code) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      await deleteCoinPackage(session.token, code)
      await refreshAdminWorkspace()
      setDashboardState({ loading: false, error: '' })
      setSuccess(`Coin package ${code} removed.`)
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function refreshUser() {
    if (!session.token) {
      return null
    }

    const user = await getMe(session.token)
    setSession((current) => ({ ...current, user }))
    return user
  }

  async function completeProfile(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const user = await completeRegistration(session.token, payload)
      setSession((current) => ({ ...current, user }))

      const [pricing, transactions, wardrobe, recommendations, tryons] = await Promise.all([
        getPricing(session.token),
        getCoinTransactions(session.token),
        getWardrobeItems(session.token),
        getRecommendationHistory(session.token),
        getTryOnHistory(session.token),
      ])

      setData({ pricing, transactions, wardrobe, recommendations, tryons })
      setDashboardState({ loading: false, error: '' })
      setSuccess('Profile completed successfully.')
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function saveProfile(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const user = await updateProfile(session.token, payload)
      setSession((current) => ({ ...current, user }))
      setDashboardState({ loading: false, error: '' })
      setSuccess('Profile updated.')
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function saveProfilePhoto(file) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const user = await uploadProfilePhoto(session.token, file)
      setSession((current) => ({ ...current, user }))
      setDashboardState({ loading: false, error: '' })
      setSuccess('Profile photo updated.')
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function changePassword(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      await updatePassword(session.token, payload)
      setDashboardState({ loading: false, error: '' })
      setSuccess('Password updated.')
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function addWardrobeItem(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const item = await uploadWardrobeItem(session.token, payload)
      setData((current) => ({
        ...current,
        wardrobe: [item, ...current.wardrobe],
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(`Added ${payload.type} to your wardrobe.`)
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function addWardrobeItems(payload) {
    const files = Array.isArray(payload.files) ? payload.files : []
    if (files.length === 0) {
      return []
    }

    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const uploadedItems = []

      for (const file of files) {
        const item = await uploadWardrobeItem(session.token, {
          type: payload.type,
          file,
        })
        uploadedItems.push(item)
      }

      setData((current) => ({
        ...current,
        wardrobe: [...uploadedItems.reverse(), ...current.wardrobe],
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(`Added ${uploadedItems.length} ${payload.type} item(s) to your wardrobe.`)
      return uploadedItems
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function removeWardrobeItem(itemId) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      await deleteWardrobeItem(session.token, itemId)
      setData((current) => ({
        ...current,
        wardrobe: current.wardrobe.filter((item) => item.id !== itemId),
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess('Wardrobe item removed.')
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function runWardrobeEmbeddingSync() {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const response = await syncWardrobeEmbeddings(session.token)
      const wardrobe = await getWardrobeItems(session.token)
      setData((current) => ({
        ...current,
        wardrobe,
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(
        `Embedding sync complete: created ${response.created}, existing ${response.existing}, failed ${response.failed}.`,
      )
      return response
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function runRecommendation(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const response = await recommendTops(session.token, payload)
      const [history, transactions, user] = await Promise.all([
        getRecommendationHistory(session.token),
        getCoinTransactions(session.token),
        refreshUser(),
      ])

      setData((current) => ({
        ...current,
        recommendations: history,
        transactions,
      }))
      setRecommendationWorkspace((current) => ({
        ...current,
        result: response,
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(
        `Found ${response.results.length} matching tops. Coins left: ${response.coin_balance ?? user?.coin_balance ?? 0}.`,
      )
      return response
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function runTryOn(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const response = await createTryOnJob(session.token, payload)
      const [history, transactions] = await Promise.all([
        getTryOnHistory(session.token),
        getCoinTransactions(session.token),
      ])

      await refreshUser()

      setData((current) => ({
        ...current,
        tryons: history,
        transactions,
      }))
      setTryOnWorkspace((current) => ({
        ...current,
        result: response,
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(`Try-on finished with status: ${response.status}.`)
      return response
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  const value = {
    authState,
    clearNotice,
    completeProfile,
    dashboardState,
    data,
    login: handleLogin,
    loginAdmin: handleAdminLogin,
    logout,
    notice,
    register: handleRegister,
    addWardrobeItems,
    removeWardrobeItem,
    runWardrobeEmbeddingSync,
    runRecommendation,
    runTryOn,
    saveProfile,
    saveProfilePhoto,
    session,
    changePassword,
    addWardrobeItem,
    tryOnWorkspace,
    setTryOnWorkspace,
    recommendationWorkspace,
    setRecommendationWorkspace,
    adminOverview: data.adminOverview,
    adminPricing: data.pricing,
    coinPackages: data.coinPackages,
    saveAdminPricing,
    saveCoinPackage,
    removeCoinPackage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
