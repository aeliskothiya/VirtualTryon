const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'

function buildHeaders(token, extraHeaders = {}) {
  const headers = { ...extraHeaders }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function request(path, options = {}) {
  const { token, body, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    headers: buildHeaders(token, headers),
  })

  if (response.status === 204) {
    return null
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error = new Error(payload?.detail || payload || 'Request failed')
    error.status = response.status
    // Attach full payload for structured error handling (e.g., {detail: {...}})
    error.payload = payload
    throw error
  }

  return payload
}

export function jsonRequest(path, method, body, token) {
  return request(path, {
    method,
    token,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

function formDataRequest(path, method, values, token) {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value)
    }
  })

  return request(path, {
    method,
    token,
    body: formData,
  })
}

export function getMediaUrl(path) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

export function registerStepOne(payload) {
  return jsonRequest('/auth/register/step-1', 'POST', payload)
}

export function completeRegistration(token, payload) {
  return formDataRequest('/auth/register/step-2', 'POST', payload, token)
}

export function loginUser(payload) {
  return jsonRequest('/auth/login', 'POST', payload)
}

export function loginAdmin(payload) {
  return jsonRequest('/admin/login', 'POST', payload)
}

export function bootstrapAdminAccount(payload) {
  return jsonRequest('/admin/bootstrap', 'POST', payload)
}

export function getMe(token) {
  return request('/me', { token })
}

export function updateProfile(token, payload) {
  return jsonRequest('/me', 'PATCH', payload, token)
}

export function updatePassword(token, payload) {
  return jsonRequest('/me/password', 'PATCH', payload, token)
}

export function uploadProfilePhoto(token, file) {
  return formDataRequest('/me/photo', 'POST', { photo: file }, token)
}

export function purchaseSubscriptionPlan(token, planCode) {
  return request(`/me/subscription/${encodeURIComponent(planCode)}`, {
    method: 'POST',
    token,
  })
}

export function createRazorpayPlanOrder(token, payload) {
  return jsonRequest('/payments/razorpay/order', 'POST', payload, token)
}

export function verifyRazorpayPlanPayment(token, payload) {
  return jsonRequest('/payments/razorpay/verify', 'POST', payload, token)
}

export function getSubscriptionPlans(token) {
  return request('/plans', { token })
}

export function getAdminPlans(token) {
  return request('/admin/plans', { token })
}

export function createAdminPlan(token, payload) {
  return jsonRequest('/admin/plans', 'POST', payload, token)
}

export function updateAdminPlan(token, code, payload) {
  return jsonRequest(`/admin/plans/${encodeURIComponent(code)}`, 'PUT', payload, token)
}

export function getWardrobeItems(token, includeInactive = false) {
  const query = includeInactive ? '?include_inactive=true' : ''
  return request(`/wardrobe/items${query}`, { token })
}

export function updateWardrobeItemStatus(token, itemId, status) {
  return jsonRequest(`/wardrobe/items/${itemId}/status`, 'PATCH', { active_status: status }, token)
}

export function uploadWardrobeItem(token, payload) {
  return formDataRequest('/wardrobe/items', 'POST', payload, token)
}

export function deleteWardrobeItem(token, itemId) {
  return request(`/wardrobe/items/${itemId}`, {
    method: 'DELETE',
    token,
  })
}

export function syncWardrobeEmbeddings(token) {
  return request('/wardrobe/embeddings/sync', {
    method: 'POST',
    token,
  })
}

export function recommendTops(token, payload) {
  return jsonRequest('/recommend', 'POST', payload, token)
}

export function getRecommendationHistory(token) {
  return request('/recommend/history', { token })
}

export function createTryOnJob(token, payload) {
  return formDataRequest('/tryon', 'POST', payload, token)
}

export function getTryOnHistory(token) {
  return request('/tryon/history', { token })
}

export function getAdminOverview(token) {
  return request('/admin/overview', { token })
}

export function sendOTP(payload) {
  return jsonRequest('/auth/send-otp', 'POST', payload)
}

export function verifyOTP(payload) {
  return jsonRequest('/auth/verify-otp', 'POST', payload)
}

export function sendPasswordResetOTP(payload) {
  return jsonRequest('/auth/password-reset/send', 'POST', payload)
}

export function verifyPasswordResetOTP(payload) {
  return jsonRequest('/auth/password-reset/verify', 'POST', payload)
}

export function resetPassword(payload) {
  return jsonRequest('/auth/password-reset/reset', 'POST', payload)
}
