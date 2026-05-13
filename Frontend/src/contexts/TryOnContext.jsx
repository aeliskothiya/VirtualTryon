import { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as tryonAPI from '@/services/api/tryon';

const TryOnContext = createContext();

const normalizeTryOnJob = (job) => {
  if (!job) return job;
  return {
    ...job,
    // Backend uses output_url; keep result_image_url for frontend compatibility.
    result_image_url: job.result_image_url || job.output_url || null,
  };
};

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
      const normalizedHistory = (response.data || []).map(normalizeTryOnJob);
      setHistory(normalizedHistory);
      return normalizedHistory;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTryOn = useCallback(async (garmentItemId, overridePhoto = null, garmentPhotoType = 'flat-lay') => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);

    // Slow simulated progress: ~0.3% every 15 seconds over ~45 mins to reach ~90%
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 0.33, 85);
      setProcessingProgress(Math.round(simulatedProgress));
      console.log('[TryOn] Simulated progress:', Math.round(simulatedProgress) + '%');
    }, 15000);

    try {
      const formData = new FormData();
      // Keep 'top_item_id' for backward API compatibility
      formData.append('top_item_id', garmentItemId);

      if (overridePhoto) {
        formData.append('override_photo', overridePhoto);
      }

      formData.append('garment_photo_type', garmentPhotoType);

      console.log('[TryOn] Creating try-on job...');
      const response = await tryonAPI.createTryOn(formData);
      clearInterval(progressInterval); // Stop initial simulation
      
      const normalizedJob = normalizeTryOnJob(response.data);
      setCurrentJob(normalizedJob);
      setProcessingProgress(5); // Start at 5% when job is created
      console.log('[TryOn] Job created:', normalizedJob.id, 'Status:', normalizedJob.status);

      // If job is created but still processing, start polling
      if (normalizedJob.status === 'processing') {
        console.log('[TryOn] Starting polling for job:', normalizedJob.id);
        const completedJob = await pollForCompletion(normalizedJob.id);
        const normalizedCompleted = normalizeTryOnJob(completedJob);
        setCurrentJob(normalizedCompleted);
        setProcessingProgress(100);
        setIsProcessing(false);
        console.log('[TryOn] Job completed:', normalizedCompleted.id);
        await fetchHistory();
      } else if (normalizedJob.status === 'completed') {
        console.log('[TryOn] Job already completed');
        setProcessingProgress(100);
        setIsProcessing(false);
        await fetchHistory();
      } else {
        console.warn('[TryOn] Unexpected job status:', normalizedJob.status);
        setIsProcessing(false);
      }

      return normalizedJob;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create try-on';
      console.error('[TryOn] Error:', errorMsg);
      setError(errorMsg);
      setIsProcessing(false);
      throw err;
    }
  }, [fetchHistory]);

  const pollForCompletion = useCallback(async (jobId) => {
    // Slow polling progress: increment ~0.5-1% every 10 seconds until completion
    let pollCount = 0;
    const progressInterval = setInterval(() => {
      pollCount++;
      // Start from 5% and increment slowly - roughly 1% per 10 seconds
      // For 45 minutes (2700 seconds): 2700/10 = 270 increments, so ~0.33% per increment to reach ~95%
      const progress = Math.min(5 + pollCount * 0.33, 95);
      setProcessingProgress(Math.round(progress));
      console.log('[TryOn] Polling progress:', Math.round(progress) + '% (backend still processing)');
    }, 10000);

    try {
      console.log('[TryOn] Polling started for job:', jobId);
      const completedJob = await tryonAPI.pollTryOnStatus(jobId);
      clearInterval(progressInterval);
      console.log('[TryOn] Polling completed. Job status:', completedJob?.status);
      
      setProcessingProgress(100);
      setCurrentJob(normalizeTryOnJob(completedJob));
      setIsProcessing(false);

      // Update history with completed job
      setHistory((prev) =>
        prev.map((job) => (job.id === jobId ? normalizeTryOnJob(completedJob) : job))
      );

      return completedJob;
    } catch (err) {
      clearInterval(progressInterval);
      const errorMsg = err.message || 'Try-on processing failed';
      console.error('[TryOn] Polling error:', errorMsg);
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
