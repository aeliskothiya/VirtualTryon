import { createContext, useContext, useState, useCallback } from 'react';
import * as adminAPI from '@/services/api/admin';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [overview, setOverview] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const adminLogin = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.adminLogin(email, password);
      const { access_token, admin: adminData } = response.data;

      localStorage.setItem('admin_token', access_token);
      localStorage.setItem('admin', JSON.stringify(adminData));

      setToken(access_token);
      setAdmin(adminData);
      setIsAuthenticated(true);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Admin login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');

    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAdminOverview();
      setOverview(response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch overview';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAdminPlans();
      setPlans(response.data || []);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch plans';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (planData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.createPlan(planData);
      setPlans((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create plan';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (planCode, planData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminAPI.updatePlan(planCode, planData);
      setPlans((prev) =>
        prev.map((plan) => (plan.code === planCode ? response.data : plan))
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update plan';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    admin,
    token,
    isAuthenticated,
    overview,
    plans,
    isLoading,
    error,
    adminLogin,
    adminLogout,
    fetchOverview,
    fetchPlans,
    createPlan,
    updatePlan,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
