import { useEffect, useState } from 'react'
import {
  getAdminOverview,
  completeRegistration,
  createTryOnJob,
  createRazorpayPlanOrder,
  deleteWardrobeItem,
  getMe,
  getRecommendationHistory,
  getTryOnHistory,
  getSubscriptionPlans,
  getAdminPlans,
  getWardrobeItems,
  loginUser,
  recommendTops,
  registerStepOne,
  purchaseSubscriptionPlan,
  syncWardrobeEmbeddings,
  updatePassword,
  updateProfile,
  uploadProfilePhoto,
  uploadWardrobeItem,
  updateWardrobeItemStatus as patchWardrobeItemStatus,
  verifyRazorpayPlanPayment,
} from '../shared/api/client'
import { openRazorpayCheckout } from '../shared/payments/razorpay'
import { loadSession, saveSession } from '../shared/session'
import { AppContext } from './AppContext'

const defaultAsyncState = {
  loading: false,
  error: '',
}

const initialData = {
  subscriptionPlans: [],
  wardrobe: [],
  recommendations: [],
  tryons: [],
  adminOverview: null,
}

const initialTryOnWorkspace = {
  form: {
    top_item_id: '',
    override_photo: null,
    garment_photo_type: 'flat-lay',
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
            const [overview, subscriptionPlans] = await Promise.all([
              getAdminOverview(session.token),
              getAdminPlans(session.token),
            ])

          if (!active) {
            return
          }

          setData((current) => ({
            ...current,
            adminOverview: overview,
            subscriptionPlans,
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

        const [subscriptionPlans, wardrobe, recommendations, tryons] = await Promise.all([
          getSubscriptionPlans(session.token),
          getWardrobeItems(session.token),
          getRecommendationHistory(session.token),
          getTryOnHistory(session.token),
        ])

        if (!active) {
          return
        }

        setData({
          subscriptionPlans,
          wardrobe,
          recommendations,
          tryons,
          adminOverview: null,
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

  function applySessionFromAuthResponse(response) {
    const kind = response?.kind === 'admin' ? 'admin' : 'user'
    const principal = kind === 'admin' ? response?.admin : response?.user
    setSession({ kind, token: response.access_token, user: principal || null })
  }

  function setSuccess(message) {
    setNotice(message)
  }

  async function refreshAdminWorkspace() {
    if (session.kind !== 'admin' || !session.token) {
      return
    }

    const [overview, subscriptionPlans] = await Promise.all([
      getAdminOverview(session.token),
      getSubscriptionPlans(session.token),
    ])

    setData((current) => ({
      ...current,
      adminOverview: overview,
      subscriptionPlans,
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
      applySessionFromAuthResponse(response)
      setAuthState({ loading: false, error: '' })
      const resolvedSuccessMessage =
        typeof successMessage === 'function' ? successMessage(response) : successMessage
      setSuccess(resolvedSuccessMessage)
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
    return runAuthAction(() => loginUser(payload), (response) =>
      response?.kind === 'admin' ? 'Admin session started.' : 'Welcome back.',
    )
  }

  async function handleAdminLogin(payload) {
    return handleLogin(payload)
  }

  async function refreshUser() {
    if (!session.token) {
      return null
    }

    const user = await getMe(session.token)
    setSession((current) => ({ ...current, user }))
    return user
  }

  async function purchasePlan(planCode) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const targetPlan = data.subscriptionPlans.find((item) => item.code === planCode)

      if (!targetPlan) {
        throw new Error('Subscription plan not found.')
      }

      if (Number(targetPlan.price_inr ?? 0) <= 0) {
        const user = await purchaseSubscriptionPlan(session.token, planCode)
        setSession((current) => ({ ...current, user }))
        const subscriptionPlans = await getSubscriptionPlans(session.token)
        setData((current) => ({
          ...current,
          subscriptionPlans,
        }))
        setSuccess(`Your subscription was updated to ${user.subscription_plan}.`)
        setDashboardState({ loading: false, error: '' })
        return user
      }

      const order = await createRazorpayPlanOrder(session.token, { plan_code: planCode })
      const user = await openRazorpayCheckout({
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        name: order.merchant_name,
        description: `${order.description} - ${order.plan_name}`,
        orderId: order.order_id,
        prefill: {
          name: order.customer_name || session.user?.name || '',
          email: order.customer_email || session.user?.email || '',
        },
        notes: {
          plan_code: order.plan_code,
        },
        theme: {
          color: '#c65d2c',
        },
        onSuccess: async (response) => {
          const verifiedUser = await verifyRazorpayPlanPayment(session.token, {
            plan_code: planCode,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          setSession((current) => ({ ...current, user: verifiedUser }))

          const subscriptionPlans = await getSubscriptionPlans(session.token)
          setData((current) => ({
            ...current,
            subscriptionPlans,
          }))

          setSuccess(`Your subscription was activated with Razorpay for ${verifiedUser.subscription_plan}.`)
          return verifiedUser
        },
      })

      setDashboardState({ loading: false, error: '' })
      if (user) {
        setSession((current) => ({ ...current, user }))
      }
      return user
    } catch (error) {
      if (handleAuthFailureIfNeeded(error)) {
        throw error
      }
      setDashboardState({ loading: false, error: error.message })
      throw error
    }
  }

  async function completeProfile(payload) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const user = await completeRegistration(session.token, payload)
      setSession((current) => ({ ...current, user }))

      const [subscriptionPlans, wardrobe, recommendations, tryons] = await Promise.all([
        getSubscriptionPlans(session.token),
        getWardrobeItems(session.token),
        getRecommendationHistory(session.token),
        getTryOnHistory(session.token),
      ])

      setData({ subscriptionPlans, wardrobe, recommendations, tryons, adminOverview: null })
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

  async function updateWardrobeItemStatus(itemId, status) {
    setDashboardState({ loading: true, error: '' })
    clearNotice()

    try {
      const updatedItem = await patchWardrobeItemStatus(session.token, itemId, status)
      setData((current) => ({
        ...current,
        wardrobe:
          status === 'active'
            ? [updatedItem, ...current.wardrobe.filter((item) => item.id !== itemId)]
            : current.wardrobe.filter((item) => item.id !== itemId),
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(
        status === 'active'
          ? 'Wardrobe item reactivated.'
          : 'Wardrobe item deactivated and removed from active wardrobe.',
      )
      return updatedItem
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
      const history = await getRecommendationHistory(session.token)
      await refreshUser()

      setData((current) => ({
        ...current,
        recommendations: history,
      }))
      setRecommendationWorkspace((current) => ({
        ...current,
        result: response,
      }))
      setDashboardState({ loading: false, error: '' })
      const remainingText =
        response.remaining_recommendations_today === null || response.remaining_recommendations_today === undefined
          ? 'Unlimited recommendations remain today.'
          : `${response.remaining_recommendations_today} recommendation(s) left today.`
      setSuccess(`Found ${response.results.length} matching tops. ${remainingText}`)
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
      const history = await getTryOnHistory(session.token)

      await refreshUser()

      setData((current) => ({
        ...current,
        tryons: history,
      }))
      setTryOnWorkspace((current) => ({
        ...current,
        result: response,
      }))
      setDashboardState({ loading: false, error: '' })
      setSuccess(response.is_saved ? 'Try-on finished and saved to history.' : 'Try-on finished as a preview only.')
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
    updateWardrobeItemStatus,
    runWardrobeEmbeddingSync,
    runRecommendation,
    runTryOn,
    purchasePlan,
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
    subscriptionPlans: data.subscriptionPlans,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
