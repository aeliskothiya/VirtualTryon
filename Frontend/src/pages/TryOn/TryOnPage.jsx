import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Upload,
  Download,
  Share2,
  ChevronUp,
  ImageOff,
  AlertCircle,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { useTryOn, useWardrobe, useNotification, useUser } from '@/hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTryOnLock } from '@/contexts/TryOnLockContext';
import { validateImageFile } from '@/utils/validators';
import { normalizeImageUrl, onImageLoad, onImageError } from '@/utils/imageLoader';
import { AnimatedButton } from '@/components/common/MicroInteractions';
import { useConfettiBlast } from '@/components/common/Confetti';

export default function TryOnPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createTryOn, currentJob, isProcessing, processingProgress } = useTryOn();
  const { fetchItems, items, getTops, getBottoms, getOnePieces } = useWardrobe();
  const { profile } = useUser();
  const { showSuccess, showError } = useNotification();
  const { trigger: triggerConfetti } = useConfettiBlast();
  const { startTryOn, updateProgress, completeTryOn } = useTryOnLock();

  const preselectedTryOn = location.state?.garmentId
    ? {
        garmentId: location.state.garmentId,
        garmentType:
          location.state.garmentType === 'top' ||
          location.state.garmentType === 'bottom' ||
          location.state.garmentType === 'one-piece'
            ? location.state.garmentType
            : 'top',
        garmentItem: location.state.garmentItem || null,
      }
    : null;
  const preselectedTryOnRef = useRef(preselectedTryOn);

  const [step, setStep] = useState('select');
  const [garmentType, setGarmentType] = useState(preselectedTryOn?.garmentType || 'top'); // 'top' or 'bottom'
  const [selectedGarment, setSelectedGarment] = useState(preselectedTryOn?.garmentItem || null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [garments, setGarments] = useState([]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [imageLoadState, setImageLoadState] = useState({}); // Track image loading
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [garmentPhotoType, setGarmentPhotoType] = useState('flat-lay');

  // Subscription checks
  const isSubscriptionExpired = profile?.is_subscription_expired;
  const planCode = profile?.subscription_plan || 'free';
  const remainingTryons = profile?.remaining_tryons_today;

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  // Update garments list based on selected garment type
  useEffect(() => {
    let newGarments = [];
    if (garmentType === 'top') newGarments = getTops();
    else if (garmentType === 'bottom') newGarments = getBottoms();
    else if (garmentType === 'one-piece') newGarments = getOnePieces();
    setGarments(newGarments);
    const shouldKeepPreselected =
      preselectedTryOnRef.current &&
      preselectedTryOnRef.current.garmentType === garmentType;
    if (!shouldKeepPreselected) {
      setSelectedGarment(null); // Reset selection when changing type manually
    }
  }, [items, getTops, getBottoms, getOnePieces, garmentType]);


  // Trigger confetti when try-on results are ready
  useEffect(() => {
    if (step === 'results' && (currentJob?.output_url || currentJob?.result_image_url)) {
      console.log('[TryOnPage] Results step active, triggering confetti');
      triggerConfetti();
    }
  }, [step, currentJob?.output_url, currentJob?.result_image_url, triggerConfetti]);

  // Keep global overlay progress in sync with try-on context progress.
  useEffect(() => {
    if (isProcessing) {
      updateProgress(processingProgress);
    }
  }, [isProcessing, processingProgress, updateProgress]);

  // Monitor job completion and transition to results
  useEffect(() => {
    if (currentJob && currentJob.status === 'completed') {
      console.log('[TryOnPage] Job completed, transitioning to results:', currentJob.id);
      setStep('results');
      completeTryOn('Your try-on is ready! Check the results below.');
    } else if (currentJob && currentJob.status === 'failed') {
      console.error('[TryOnPage] Job failed:', currentJob.error_message);
      showError(currentJob.error_message || 'Try-on generation failed');
      setStep('select');
    }
  }, [currentJob, completeTryOn, showError]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) await processFile(files[0]);
  };

  const processFile = async (file) => {
    try {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        showError(validation.error);
        return;
      }
      setUserPhoto(file);
    } catch (error) {
      showError('File validation failed');
    }
  };

  const handleStartTryOn = async () => {
    if (!selectedGarment) {
      const garmentName = garmentType === 'top' ? 'top' : garmentType === 'bottom' ? 'bottom' : 'one-piece';
      showError(`Please select a ${garmentName} item`);
      return;
    }
    if (!userPhoto) {
      showError('Please upload your photo');
      return;
    }

    // Block if subscription expired
    if (isSubscriptionExpired) {
      setShowUpgradeModal(true);
      return;
    }

    // Block if daily limit reached
    if (remainingTryons !== null && remainingTryons !== undefined && remainingTryons <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setStep('process');
    startTryOn(); // Lock UI globally
    try {
      await createTryOn(selectedGarment.id, userPhoto, garmentPhotoType);
      showSuccess('Try-on started!');
    } catch (error) {
      showError(error.message || 'Try-on failed');
      setStep('select');
    }
  };

  const handleImageLoad = (id) => {
    setImageLoadState((prev) => ({
      ...prev,
      [id]: 'loaded',
    }));
  };

  const handleImageError = (id, imageUrl) => {
    onImageError(imageUrl);
    setImageLoadState((prev) => ({
      ...prev,
      [id]: 'error',
    }));
  };

  const getImageUrl = (item) => {
    return normalizeImageUrl(item.image_url) || '/placeholder-wardrobe.svg';
  };

  const resultImageUrl =
    normalizeImageUrl(currentJob?.output_url || currentJob?.result_image_url) ||
    currentJob?.output_url ||
    currentJob?.result_image_url ||
    null;

  const handleSliderMove = (e) => {
    if (!isSliderDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const topContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const topItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { y: -8, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-warm-gray/30 px-4 sm:px-8 py-6"
      >
        <div className="container-luxury flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-ivory rounded-lg transition-colors"
            >
              <ArrowLeft size={22} className="text-charcoal" />
            </motion.button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal">
                Virtual Try-On
              </h1>
              <p className="text-warm-taupe text-sm">
                See how items look on you with AI
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* FLAT-LAY ONLY NOTE */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Step 1: Prepare Your Photo</h2>
                  <p className="text-warm-taupe">We use flat-lay garment photos for precise virtual try-on. Upload a clear photo of yourself.</p>
                  {preselectedTryOnRef.current && (
                    <p className="mt-4 text-sm text-gold-accent font-medium">
                      ✓ Garment selected. Upload your photo to continue.
                    </p>
                  )}
                </div>
              </section>

              {/* PHOTO-TYPE SELECTOR (Flat-lay / On-model) */}
              <section>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-charcoal mb-2">Photo Type</label>
                  <select
                    value={garmentPhotoType}
                    onChange={(e) => setGarmentPhotoType(e.target.value)}
                    className="p-2 border rounded-lg bg-ivory"
                  >
                    <option value="flat-lay">Flat-lay (recommended)</option>
                    <option value="on-model">On-model</option>
                  </select>
                </div>
              </section>

              {/* GARMENT SELECTION */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">
                    Step 2: Select Your Flat-Lay Item
                  </h2>
                  <p className="text-warm-taupe">Choose a garment from your wardrobe</p>
                </div>

                {garments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-luxury text-center py-16"
                  >
                    <ImageOff size={48} className="mx-auto text-warm-gray mb-4" />
                    <h3 className="text-xl font-bold text-charcoal mb-2">
                      No garments yet
                    </h3>
                    <p className="text-warm-taupe mb-6">
                      Build your wardrobe first to start trying on
                    </p>
                    <AnimatedButton
                      variant="primary"
                      onClick={() => navigate('/wardrobe')}
                    >
                      Go to Wardrobe
                    </AnimatedButton>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={topContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  >
                    {garments.map((item) => (
                      <motion.button
                        key={item.id}
                        variants={topItemVariants}
                        whileHover="hover"
                        onClick={() => setSelectedGarment(item)}
                        className={`card-luxury p-4 relative overflow-hidden group cursor-pointer transition-all ${
                          selectedGarment?.id === item.id
                            ? 'ring-2 ring-gold-accent'
                            : 'hover:ring-1 hover:ring-warm-gray'
                        }`}
                      >
                        {/* Image */}
                        <div className="aspect-square overflow-hidden rounded-lg bg-beige mb-3">
                          {imageLoadState[item.id] !== 'error' ? (
                            <>
                              {imageLoadState[item.id] !== 'loaded' && (
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="absolute inset-0 bg-warm-gray/20"
                                />
                              )}
                              <motion.img
                                whileHover={{ scale: 1.1 }}
                                src={getImageUrl(item)}
                                alt="Garment item"
                                className="w-full h-full object-cover"
                                onLoad={() => handleImageLoad(item.id)}
                                onError={(e) => handleImageError(item.id, item.image_url)}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff size={24} className="text-warm-gray" />
                            </div>
                          )}
                        </div>

                        {/* Selection Badge */}
                        <AnimatePresence>
                          {selectedGarment?.id === item.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 w-6 h-6 bg-gold-accent rounded-full flex items-center justify-center text-cream"
                            >
                              ✓
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </section>

              {/* PHOTO UPLOAD */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Step 3: Upload Your Photo</h2>
                  <p className="text-warm-taupe">A clear photo of yourself for accurate virtual try-on</p>
                </div>

                <motion.div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
                  className={`relative rounded-2xl border-2 border-dashed p-12 sm:p-16 transition-all cursor-pointer ${
                    dragActive
                      ? 'border-gold-accent bg-gold-accent/5'
                      : 'border-warm-gray/50 bg-ivory hover:border-gold-accent hover:bg-gold-accent/2'
                  }`}
                >
                  {userPhoto ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden shadow-luxury">
                        <img
                          src={URL.createObjectURL(userPhoto)}
                          alt="Your photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-sm font-medium text-charcoal">{userPhoto.name}</p>
                        <AnimatedButton
                          variant="secondary"
                          onClick={() => setUserPhoto(null)}
                        >
                          Change Photo
                        </AnimatedButton>
                      </div>
                    </motion.div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center py-8">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="mb-6"
                        >
                          <Upload size={56} className="text-gold-accent" />
                        </motion.div>
                        <h3 className="text-2xl font-semibold text-charcoal mb-2 text-center">
                          Drag your photo here
                        </h3>
                        <p className="text-warm-taupe text-center mb-6">
                          or click to browse
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) processFile(e.target.files[0]);
                          }}
                          className="hidden"
                        />
                        <div className="text-xs text-warm-taupe">JPG, PNG • Up to 10MB</div>
                      </div>
                    </label>
                  )}
                </motion.div>
              </section>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-warm-gray/50">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={handleStartTryOn}
                  disabled={!selectedGarment || !userPhoto}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold"
                >
                  <Play size={20} />
                  Generate Try-On
                </AnimatedButton>
              </div>
              {isSubscriptionExpired && (
                <div className="mt-4 p-3 bg-rose-dust/10 rounded-lg border border-rose-dust/20 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-dust" />
                  <p className="text-xs text-rose-dust font-medium">
                    Your subscription has expired. Please renew to continue using virtual try-on.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: PROCESSING */}
          {step === 'process' && (
            <motion.div
              key="process"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 space-y-10"
            >
              {/* Animated Loader */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="relative w-40 h-40"
              >
                <div className="absolute inset-0 bg-gradient-sage/20 rounded-full blur-2xl" />
                <div className="absolute inset-4 border-2 border-warm-gray/30 rounded-full" />
                <div className="absolute inset-8 border-2 border-sage rounded-full border-t-gold-accent border-r-powder-blue" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-bold text-gradient-gold">✨</div>
                </div>
              </motion.div>

              {/* Text */}
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold text-charcoal mb-3">
                  Generating Your Try-On
                </h2>
                <p className="text-warm-taupe mb-8">
                  Our AI is analyzing your photo and applying the garment with precise accuracy...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-charcoal">Progress</span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-sm font-bold text-gold-accent"
                  >
                    {processingProgress}%
                  </motion.span>
                </div>
                <div className="h-3 bg-warm-gray/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-gold"
                    initial={{ width: '15%' }}
                    animate={{ width: `${Math.max(processingProgress, 15)}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <p className="text-sm text-warm-taupe">
                ⏱️ Estimated time: 1-2 minutes
              </p>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 'results' && currentJob && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              {/* BEFORE/AFTER SLIDER */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Your Transformation</h2>
                  <p className="text-warm-taupe">Drag the slider to compare before and after</p>
                </div>

                <div
                  onMouseMove={handleSliderMove}
                  onMouseDown={() => setIsSliderDragging(true)}
                  onMouseUp={() => setIsSliderDragging(false)}
                  onMouseLeave={() => setIsSliderDragging(false)}
                  className="card-luxury overflow-hidden rounded-2xl cursor-col-resize"
                >
                  <div className="relative aspect-video bg-beige overflow-hidden group">
                    {/* BEFORE IMAGE */}
                    <div className="absolute inset-0">
                      {userPhoto && (
                        <img
                          src={URL.createObjectURL(userPhoto)}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md"
                      >
                        <p className="text-white text-sm font-semibold">BEFORE</p>
                      </motion.div>
                    </div>

                    {/* AFTER IMAGE (SLIDER) */}
                    <div
                      className="absolute inset-0 overflow-hidden transition-all"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      {resultImageUrl && imageLoadState['result'] !== 'error' ? (
                        <>
                          {imageLoadState['result'] !== 'loaded' && (
                            <motion.div
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              className="absolute inset-0 bg-warm-gray/20 z-10"
                            />
                          )}
                          <img
                            src={resultImageUrl}
                            alt="After"
                            className="w-screen h-full object-cover"
                            onLoad={() => handleImageLoad('result')}
                            onError={() => handleImageError('result', resultImageUrl)}
                          />
                        </>
                      ) : resultImageUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-beige">
                          <div className="text-center">
                            <ImageOff size={32} className="text-warm-gray mx-auto mb-2" />
                            <p className="text-xs text-warm-taupe">Result image unavailable</p>
                          </div>
                        </div>
                      ) : null}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-gold-accent text-cream"
                      >
                        <p className="text-sm font-semibold">AFTER</p>
                      </motion.div>
                    </div>

                    {/* SLIDER HANDLE */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-gold-accent"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <motion.div
                        animate={{ x: [-2, 2, -2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gold-accent rounded-full flex items-center justify-center shadow-luxury cursor-grab active:cursor-grabbing"
                      >
                        <ChevronUp size={24} className="text-cream rotate-90" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  ← Back to Dashboard
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Result
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </AnimatedButton>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

        </div>

      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpgradeModal(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-cream rounded-2xl shadow-luxury overflow-hidden"
            >
              <div className="h-2 bg-gradient-gold" />
              <div className="p-8">
                <div className="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Crown size={32} className="text-gold-accent" />
                </div>
                
                <h3 className="text-2xl font-bold text-charcoal text-center mb-3">
                  {isSubscriptionExpired ? 'Subscription Expired' : 'Daily Limit Reached'}
                </h3>
                
                <p className="text-warm-taupe text-center mb-8">
                  {isSubscriptionExpired
                    ? "Your premium access has expired. Renew your subscription to continue creating stunning virtual looks."
                    : planCode === 'free'
                    ? "You've used all your free credits for today. Upgrade to a premium plan to continue your style journey."
                    : "You've reached your daily try-on limit for the " + planCode + " plan. Upgrade for more creations or try again tomorrow."}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1"
                  >
                    Maybe Later
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    onClick={() => navigate('/subscription')}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    View Plans
                    <Play size={16} className="rotate-0" />
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


