import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser, useNotification } from '@/hooks';
import { LogOut, Settings, ShoppingBag, Zap, Wand2, TrendingUp, Calendar, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/validators';
import { normalizeImageUrl, getFallbackImage } from '@/utils/imageLoader';
import { AnimatedButton } from '@/components/common/MicroInteractions';
import { AnimatedStaggerContainer, AnimatedStaggerItem, ScrollAnimationWrapper } from '@/components/common/AnimationComponents';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const { profile, fetchProfile, isLoading } = useUser();
  const { showSuccess, showError } = useNotification();
  const [animateCards, setAnimateCards] = useState(false);
  const [imageLoadState, setImageLoadState] = useState({});

  const handleImageLoad = (id) => {
    setImageLoadState(prev => ({ ...prev, [id]: 'loaded' }));
  };

  const handleImageError = (id) => {
    setImageLoadState(prev => ({ ...prev, [id]: 'error' }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchProfile();
        setAnimateCards(true);
      } catch (err) {
        showError('Failed to load profile');
      }
    };

    if (authUser?.id) {
      loadProfile();
    }
  }, [authUser?.id, fetchProfile, showError]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      showSuccess('Logged out successfully');
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const quotaCards = profile
    ? [
        {
          label: 'Wardrobe Items',
          current: profile.wardrobe_used || 0,
          total: profile.wardrobe_limit || 100,
          icon: ShoppingBag,
          color: 'bg-powder-blue',
          gradient: 'gradient-powder',
        },
        {
          label: 'Try-Ons Today',
          current: profile.tryons_used_today || 0,
          total: profile.tryon_daily_limit || 10,
          icon: Zap,
          color: 'bg-sage',
          gradient: 'gradient-sage',
        },
        {
          label: 'AI Recommendations',
          current: profile.recommendations_used_today || 0,
          total: profile.recommendation_daily_limit || 5,
          icon: Wand2,
          color: 'bg-rose-dust',
          gradient: 'gradient-rose',
        },
      ]
    : [];

  const actionButtons = [
    { label: 'My Wardrobe', path: '/wardrobe', icon: ShoppingBag, bg: 'gradient-powder' },
    { label: 'Try-On Now', path: '/tryon', icon: Zap, bg: 'gradient-sage' },
    { label: 'Get Recommendations', path: '/recommendations', icon: Wand2, bg: 'gradient-rose' },
  ];

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
            {profile?.profile_photo_url ? (
              imageLoadState['profile'] === 'error' ? (
                <div className="w-14 h-14 rounded-full border-2 border-gold-accent bg-ivory flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
              ) : (
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  src={normalizeImageUrl(profile.profile_photo_url)}
                  alt="Profile"
                  className="w-14 h-14 rounded-full border-2 border-gold-accent object-cover"
                  onLoad={() => handleImageLoad('profile')}
                  onError={() => handleImageError('profile')}
                />
              )
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-gold-accent bg-ivory flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
                Welcome back, {profile?.name || authUser?.name?.split(' ')[0]}
              </h1>
              <p className="text-warm-taupe text-sm">
                {profile?.subscription_plan ? (
                  <>
                    <span className="capitalize font-medium">{profile.subscription_plan}</span> Plan
                  </>
                ) : (
                  'Free Plan'
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {profile?.subscription_plan !== 'premium' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/subscription')}
                className="px-4 py-2 rounded-lg bg-gold-accent text-cream font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                title="Upgrade Plan"
              >
                <Crown size={18} />
                <span className="hidden sm:inline">Upgrade</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => navigate('/settings')}
              className="p-3 hover:bg-ivory rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-charcoal" />
            </motion.button>
            <motion.button
              onClick={handleLogout}
              className="p-3 hover:bg-rose-dust/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} className="text-rose-dust" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        {/* SUBSCRIPTION STATUS CARD */}
        {profile && !profile.is_subscription_expired && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="card-luxury relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-accent/10 rounded-full -mr-20 -mt-20" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-semibold text-warm-taupe uppercase tracking-wider mb-2">
                      Current Plan
                    </h3>
                    <p className="text-3xl font-bold text-charcoal capitalize">
                      {profile.subscription_plan || 'Free'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/10">
                      <Calendar size={16} className="text-sage" />
                      <span className="text-sm font-medium text-sage">Active</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-warm-taupe mb-1">Cycle Start</p>
                    <p className="font-medium text-charcoal">
                      {formatDate(profile.subscription_cycle_start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-warm-taupe mb-1">Cycle End</p>
                    <p className="font-medium text-charcoal">
                      {formatDate(profile.subscription_cycle_end)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* QUOTAS SECTION */}
        {animateCards && quotaCards.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
                Your Usage Today
              </h2>
              <p className="text-warm-taupe">Track your daily activity and limits</p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {quotaCards.map((quota, i) => {
                const Icon = quota.icon;
                const percentage = quota.total > 0 ? (quota.current / quota.total) * 100 : 0;
                const isExpiring = percentage > 75;
                const isMaxed = percentage >= 100;

                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="card-luxury relative overflow-hidden group"
                  >
                    {/* Background accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${quota.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500`} />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <h3 className="text-sm font-semibold text-warm-taupe uppercase tracking-wider">
                          {quota.label}
                        </h3>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className={`p-3 rounded-lg text-cream ${quota.gradient}`}
                        >
                          <Icon size={20} />
                        </motion.div>
                      </div>

                      {/* Usage Numbers */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-charcoal">
                            {quota.current}
                          </span>
                          <span className="text-warm-taupe text-sm">
                            of {quota.total}
                          </span>
                        </div>
                        <p className="text-xs text-warm-taupe">
                          {Math.round(percentage)}% used
                          {isMaxed && <span className="ml-2 text-rose-dust font-semibold">Maxed</span>}
                          {isExpiring && !isMaxed && <span className="ml-2 text-gold-accent font-semibold">Expiring Soon</span>}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 bg-warm-gray/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          className={`h-full ${
                            isMaxed
                              ? 'bg-rose-dust'
                              : isExpiring
                              ? `${quota.gradient}`
                              : quota.gradient
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>
        )}

        {/* QUICK ACTIONS */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal mb-2">
              Quick Actions
            </h2>
            <p className="text-warm-taupe">Get started with your next fashion moment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actionButtons.map((btn, i) => {
              const Icon = btn.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(btn.path)}
                  className={`card-luxury relative overflow-hidden group cursor-pointer text-left`}
                >
                  <div className={`absolute inset-0 ${btn.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative flex flex-col h-full">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-12 h-12 rounded-lg ${btn.bg} text-cream flex items-center justify-center mb-4`}
                    >
                      <Icon size={24} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-charcoal group-hover:text-gold-accent transition-colors">
                      {btn.label}
                    </h3>
                    <p className="text-sm text-warm-taupe mt-auto">
                      Click to get started →
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
