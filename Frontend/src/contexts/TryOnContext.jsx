import { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as tryonAPI from '@/services/api/tryon';

const TryOnContext = createContext();

export const TryOnProvider = ({ children }) => {
  const [currentJob, setCurrentJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const pollingRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await tryonAPI.getTryOnHistory();
      setHistory(response.data || []);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTryOn = useCallback(async (topItemId, overridePhoto = null) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('top_item_id', topItemId);

      if (overridePhoto) {
        formData.append('override_photo', overridePhoto);
      }

      formData.append('garment_photo_type', 'flat-lay');

      const response = await tryonAPI.createTryOn(formData);
      setCurrentJob(response.data);
      setProcessingProgress(10);

      // If job is created but still processing, start polling
      if (response.data.status === 'processing') {
        pollForCompletion(response.data.id);
      } else if (response.data.status === 'completed') {
        setProcessingProgress(100);
        setIsProcessing(false);
        // Refresh history
        await fetchHistory();
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create try-on';
      setError(errorMsg);
      setIsProcessing(false);
      throw err;
    }
  }, [fetchHistory]);

  const pollForCompletion = useCallback(async (jobId) => {
    // Simulate progress while polling
    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 8, 95);
      setProcessingProgress(simulatedProgress);
    }, 500);

    try {
      const completedJob = await tryonAPI.pollTryOnStatus(jobId);
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setCurrentJob(completedJob);
      setIsProcessing(false);

      // Update history
      setHistory((prev) =>
        prev.map((job) => (job.id === jobId ? completedJob : job))
      );

      return completedJob;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMsg = err.message || 'Try-on processing failed';
      setError(errorMsg);
      setIsProcessing(false);
      throw err;
    }
  }, []);

  const cancelPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
    setIsProcessing(false);
    setProcessingProgress(0);
  }, []);

  const saveTryOn = useCallback(async (jobId) => {
    try {
      // Backend endpoint for saving not documented yet
      // For now, update local state
      setHistory((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, is_saved: true } : job))
      );
    } catch (err) {
      console.error('Failed to save try-on:', err);
    }
  }, []);

  const value = {
    currentJob,
    history,
    isLoading,
    error,
    isProcessing,
    processingProgress,
    fetchHistory,
    createTryOn,
    pollForCompletion,
    cancelPolling,
    saveTryOn,
  };

  return <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>;
};

export const useTryOn = () => {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error('useTryOn must be used within TryOnProvider');
  }
  return context;
};
