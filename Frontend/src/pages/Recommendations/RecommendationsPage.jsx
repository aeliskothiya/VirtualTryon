import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, ArrowLeft, Sparkles, TrendingUp, ImageOff } from 'lucide-react';
import { useRecommendation, useWardrobe, useNotification } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { normalizeImageUrl, onImageError } from '@/utils/imageLoader';
import { AnimatedButton } from '@/components/common/MicroInteractions';
import { useConfettiBlast } from '@/components/common/Confetti';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { fetchRecommendations, recommendations, remainingRecommendations, isLoading } = useRecommendation();
  const { getBottoms } = useWardrobe();
  const { showSuccess, showError } = useNotification();
  const { triggerConfetti } = useConfettiBlast();

  const [occasion, setOccasion] = useState('casual');
  const [bottomItem, setBottomItem] = useState(null);
  const [bottoms, setBottoms] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoadState, setImageLoadState] = useState({});

  useEffect(() => {
    setBottoms(getBottoms());
  }, []);

  // Trigger confetti when recommendations are successfully fetched
  useEffect(() => {
    if (showResults && recommendations.length > 0) {
      triggerConfetti();
    }
  }, [showResults, recommendations.length, triggerConfetti]);

  const occasionOptions = [
    { value: 'casual', label: 'Casual', icon: '👕' },
    { value: 'formal', label: 'Formal', icon: '🎩' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'party', label: 'Party', icon: '🎉' },
    { value: 'date', label: 'Date Night', icon: '💕' },
    { value: 'sports', label: 'Sports', icon: '⚽' },
    { value: 'beach', label: 'Beach', icon: '🏖️' },
    { value: 'vacation', label: 'Vacation', icon: '✈️' },
    { value: 'work', label: 'Work', icon: '🏢' },
    { value: 'outdoor', label: 'Outdoor', icon: '🏔️' },
  ];

  const handleGetRecommendations = async () => {
    if (!bottomItem) {
      showError('Please select a bottom item');
      return;
    }
    if (remainingRecommendations <= 0) {
      showError('You\'ve used all recommendations for today');
      return;
    }

    setLoading(true);
    try {
      await fetchRecommendations(bottomItem.id, occasion);
      setShowResults(true);
      showSuccess('Recommendations generated!');
    } catch (error) {
      showError(error.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score) => {
    if (!score) return 'text-warm-taupe';
    if (score >= 80) return 'text-sage';
    if (score >= 60) return 'text-powder-blue';
    return 'text-rose-dust';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { y: -8 },
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
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-ivory rounded-lg transition-colors"
            >
              <ArrowLeft size={22} className="text-charcoal" />
            </motion.button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal">
                AI Stylist
              </h1>
              <p className="text-warm-taupe text-sm">
                Get personalized outfit recommendations
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="p-3 bg-ivory rounded-lg"
          >
            <Sparkles size={24} className="text-gold-accent" />
          </motion.div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        <AnimatePresence mode="wait">
          {!showResults ? (
            // CONFIGURATION SCREEN
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              {/* OCCASION SELECTION */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">What's the occasion?</h2>
                  <p className="text-warm-taupe">Choose the vibe you're going for</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {occasionOptions.map((occ) => (
                    <motion.button
                      key={occ.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setOccasion(occ.value)}
                      className={`card-luxury p-6 text-center space-y-3 relative overflow-hidden group transition-all ${
                        occasion === occ.value
                          ? 'ring-2 ring-gold-accent'
                          : 'hover:ring-1 hover:ring-warm-gray'
                      }`}
                    >
                      <div className="text-4xl">{occ.icon}</div>
                      <p className={`font-semibold text-sm transition-colors ${
                        occasion === occ.value ? 'text-gold-accent' : 'text-charcoal'
                      }`}>
                        {occ.label}
                      </p>
                      <AnimatePresence>
                        {occasion === occ.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-gold-accent rounded-full"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* BOTTOM SELECTION */}
              <section>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">Select a bottom item</h2>
                  <p className="text-warm-taupe">Pick the bottoms you want to style</p>
                </div>

                {bottoms.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-luxury text-center py-16"
                  >
                    <ImageOff size={48} className="mx-auto text-warm-gray mb-4" />
                    <h3 className="text-xl font-bold text-charcoal mb-2">No bottoms yet</h3>
                    <p className="text-warm-taupe mb-6">Add bottoms to your wardrobe first</p>
                    <AnimatedButton
                      variant="primary"
                      onClick={() => navigate('/wardrobe')}
                    >
                      Go to Wardrobe
                    </AnimatedButton>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    {bottoms.map((item) => (
                      <motion.button
                        key={item.id}
                        variants={itemVariants}
                        whileHover="hover"
                        onClick={() => setBottomItem(item)}
                        className={`card-luxury p-4 relative overflow-hidden group transition-all ${
                          bottomItem?.id === item.id
                            ? 'ring-2 ring-gold-accent'
                            : 'hover:ring-1 hover:ring-warm-gray'
                        }`}
                      >
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
                                src={normalizeImageUrl(item.image_url) || item.image_url}
                                alt="Bottom item"
                                className="w-full h-full object-cover"
                                onLoad={() =>
                                  setImageLoadState((prev) => ({ ...prev, [item.id]: 'loaded' }))
                                }
                                onError={() => {
                                  onImageError(item.image_url);
                                  setImageLoadState((prev) => ({ ...prev, [item.id]: 'error' }));
                                }}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff size={24} className="text-warm-gray" />
                            </div>
                          )}
                        </div>
                        <AnimatePresence>
                          {bottomItem?.id === item.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute top-2 right-2 w-6 h-6 bg-gold-accent rounded-full flex items-center justify-center text-cream text-sm"
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
                  onClick={handleGetRecommendations}
                  disabled={!bottomItem || loading || remainingRecommendations <= 0}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold"
                >
                  <Wand2 size={20} />
                  {loading ? 'Generating...' : 'Get Recommendations'}
                </AnimatedButton>
              </div>
            </motion.div>
          ) : (
            // RESULTS SCREEN
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal mb-1">
                    Top Picks for {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </h2>
                  <p className="text-warm-taupe">
                    {recommendations.length} stylish options recommended
                  </p>
                </div>
                <AnimatedButton
                  variant="ghost"
                  onClick={() => setShowResults(false)}
                  className="text-sm"
                >
                  ← Start Over
                </AnimatedButton>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton h-96 rounded-xl" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card-luxury text-center py-16"
                >
                  <h3 className="text-xl font-bold text-charcoal mb-2">No recommendations found</h3>
                  <p className="text-warm-taupe">Try a different combination</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {recommendations.map((outfit, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      whileHover="hover"
                      className="card-luxury overflow-hidden"
                    >
                      {/* OUTFIT IMAGE */}
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-beige mb-6">
                        {imageLoadState[`outfit-${outfit.id}`] !== 'error' ? (
                          <>
                            {imageLoadState[`outfit-${outfit.id}`] !== 'loaded' && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 bg-warm-gray/20"
                              />
                            )}
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={normalizeImageUrl(outfit.top_image) || outfit.top_image}
                              alt="Outfit recommendation"
                              className="w-full h-full object-cover"
                              onLoad={() =>
                                setImageLoadState((prev) => ({
                                  ...prev,
                                  [`outfit-${outfit.id}`]: 'loaded',
                                }))
                              }
                              onError={() => {
                                onImageError(outfit.top_image);
                                setImageLoadState((prev) => ({
                                  ...prev,
                                  [`outfit-${outfit.id}`]: 'error',
                                }));
                              }}
                            />
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff size={40} className="text-warm-gray" />
                          </div>
                        )}
                      </div>

                      {/* INFO */}
                      <div className="space-y-4">
                        {/* COMPATIBILITY SCORE */}
                        {outfit.compatibility_score && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-charcoal">Compatibility</span>
                              <span className={`text-lg font-bold ${getCompatibilityColor(outfit.compatibility_score)}`}>
                                {Math.round(outfit.compatibility_score)}%
                              </span>
                            </div>
                            <div className="h-2 bg-warm-gray/20 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${
                                  outfit.compatibility_score >= 80
                                    ? 'gradient-sage'
                                    : 'gradient-powder'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${outfit.compatibility_score}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* TRY ON BUTTON */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/tryon')}
                          className="w-full btn-primary py-3 font-semibold"
                        >
                          Try This On →
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
