import API from '../axios';

// Get all subscription plans
export const getSubscriptionPlans = () => {
  return API.get('/plans');
};

// Purchase subscription (activate plan)
export const purchaseSubscription = (planCode) => {
  return API.post(`/me/subscription/${planCode}`);
};

// Create Razorpay payment order
export const createPaymentOrder = (planCode) => {
  return API.post('/payments/razorpay/order', {
    plan_code: planCode,
  });
};

// Verify Razorpay payment
export const verifyPayment = (planCode, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  return API.post('/payments/razorpay/verify', {
    plan_code: planCode,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  });
};
