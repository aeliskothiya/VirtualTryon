import { createContext, useContext, useState, useCallback } from 'react';
import * as paymentAPI from '@/services/api/payment';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[SubscriptionContext] Fetching subscription plans...');
      const response = await paymentAPI.getSubscriptionPlans();
      console.log('[SubscriptionContext] Plans fetched successfully:', response.data);
      setPlans(response.data || []);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch subscription plans';
      console.error('[SubscriptionContext] Error fetching plans:', errorMsg, err.response?.data);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPaymentOrder = useCallback(async (planCode) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentAPI.createPaymentOrder(planCode);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create payment order';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyPayment = useCallback(async (planCode, orderId, paymentId, signature) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await paymentAPI.verifyPayment(
        planCode,
        orderId,
        paymentId,
        signature
      );
      setCurrentPlan(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Payment verification failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlanByCode = useCallback(
    (code) => {
      return plans.find((plan) => plan.code === code);
    },
    [plans]
  );

  const value = {
    plans,
    currentPlan,
    isLoading,
    error,
    fetchPlans,
    createPaymentOrder,
    verifyPayment,
    getPlanByCode,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
