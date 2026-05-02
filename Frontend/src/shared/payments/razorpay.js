let razorpayScriptPromise = null

export function loadRazorpayCheckoutScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay checkout is only available in the browser.'))
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay)
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-razorpay-checkout="true"]')
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.Razorpay))
        existingScript.addEventListener('error', () => reject(new Error('Unable to load Razorpay checkout.')))
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.dataset.razorpayCheckout = 'true'
      script.onload = () => resolve(window.Razorpay)
      script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'))
      document.head.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

export async function openRazorpayCheckout(options) {
  await loadRazorpayCheckoutScript()

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      notes: options.notes,
      theme: options.theme,
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled.')),
      },
      handler: (response) => {
        Promise.resolve(options.onSuccess(response)).then(resolve).catch(reject)
      },
    })

    checkout.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed.'))
    })

    checkout.open()
  })
}