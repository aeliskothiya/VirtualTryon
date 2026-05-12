import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, ArrowLeft, Zap, Lock, ArrowRight } from 'lucide-react';
import { useSubscription, useNotification, useUser } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton, AnimatedCard } from '@/components/common/MicroInteractions';
import { AnimatedStaggerContainer, AnimatedStaggerItem } from '@/components/common/AnimationComponents';
import { useConfettiBlast } from '@/components/common/Confetti';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { plans, fetchPlans, createPaymentOrder, currentPlan, isLoading } = useSubscription();
  const { profile } = useUser();
  const { showSuccess, showError } = useNotification();
  const { triggerConfetti } = useConfettiBlast();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    console.log('[SubscriptionPage] Component mounted, fetching plans...');
    fetchPlans().catch(err => {
      console.error('[SubscriptionPage] Failed to fetch subscription plans:', err);
      showError('Failed to load subscription plans');
    });
  }, []);

  const handleUpgrade = async (plan) => {
    if (processing || currentPlan?.id === plan.id) return;

    setProcessing(true);
    try {
      const order = await createPaymentOrder(plan.code, billingCycle);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        order_id: order.id,
        name: 'FashionAI',
        description: `${plan.name} - ${billingCycle}`,
        handler: (response) => {
          triggerConfetti();
          showSuccess('Payment successful! Welcome to your new plan.');
          navigate('/dashboard');
        },
        prefill: {
          email: profile?.email || '',
          name: profile?.name || '',
        },
        theme: { color: '#c4a962' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      showError(error.message || 'Payment setup failed');
    } finally {
      setProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };

  const planVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    hover: { y: -12, transition: { duration: 0.3 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.4 },
    }),
  };

  const planFeatures = {
    free: [
      'Up to 20 wardrobe items',
      '5 try-ons per day',
      '3 recommendations per day',
      '480p image quality',
      'Community support',
    ],
    premium: [
      'Unlimited wardrobe items',
      '20 try-ons per day',
      '10 recommendations per day',
      '1080p image quality',
      'Priority support',
      'Save try-on results',
      'Monthly insights',
    ],
    pro: [
      'Everything in Premium',
      '50 try-ons per day',
      'Unlimited recommendations',
      '4K image quality',
      '24/7 dedicated support',
      'Advanced analytics',
      'API access',
      'Custom integrations',
    ],
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
                Plans & Pricing
              </h1>
              <p className="text-warm-taupe text-sm">
                Find the perfect plan for your style
              </p>
            </div>
          </div>
          <div className="p-3 bg-ivory rounded-lg">
            <Crown size={24} className="text-gold-accent" />
          </div>
        </div>
      </motion.header>

      <div className="container-luxury section-padding">
        {/* BILLING CYCLE TOGGLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-1 p-1 bg-ivory rounded-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-sage text-cream shadow-luxury'
                  : 'text-charcoal hover:text-gold-accent'
              }`}
            >
              Monthly
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-sage text-cream shadow-luxury'
                  : 'text-charcoal hover:text-gold-accent'
              }`}
            >
              Yearly <span className="ml-2 text-xs bg-gold-accent/20 text-gold-accent px-2 py-1 rounded-full">Save 20%</span>
            </motion.button>
          </div>
        </motion.div>

        {/* CURRENT PLAN NOTICE */}
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-12 p-6 bg-sage/10 rounded-xl border border-sage/30"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-sage/20 rounded-lg mt-1">
                <Check size={20} className="text-sage" />
              </div>
              <div>
                <p className="font-semibold text-charcoal mb-1">Current Plan</p>
                <p className="text-sm text-warm-taupe">
                  You're currently on the <span className="font-medium">{currentPlan.name}</span> plan
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* PLANS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {plans?.filter(plan => plan.price_inr > 0).map((plan, i) => (
              <motion.div
                key={plan.code}
                variants={planVariants}
                whileHover="hover"
                className={`card-luxury relative overflow-hidden group transition-all ${
                  currentPlan?.code === plan.code ? 'ring-2 ring-gold-accent scale-105' : ''
                } ${plan.name.toLowerCase() === 'premium' ? 'md:scale-105' : ''}`}
              >
                {/* PREMIUM BADGE */}
                {plan.name.toLowerCase() === 'premium' && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 right-4 px-4 py-1 bg-gradient-gold text-cream rounded-full text-xs font-bold"
                  >
                    Most Popular
                  </motion.div>
                )}

                {/* CURRENT PLAN BADGE */}
                {currentPlan?.code === plan.code && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-sage text-cream rounded-full text-xs font-semibold">
                    Current
                  </div>
                )}

                {/* PLAN INFO */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-charcoal mb-2 capitalize">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-warm-taupe mb-4">{plan.description}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-4xl font-bold text-gold-accent">
                        ₹{billingCycle === 'monthly' ? Math.round(plan.price_inr) : Math.round(plan.price_inr * 12 * 0.8)}
                      </span>
                      <span className="text-warm-taupe ml-2 text-sm">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-sage font-semibold">
                        Save 20% with annual billing
                      </p>
                    )}
                  </div>
                </div>

                {/* FEATURES */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-sage/10 rounded">
                      <Check size={16} className="text-sage" />
                    </div>
                    <span className="text-sm text-charcoal">
                      {plan.wardrobe_limit} wardrobe items
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-sage/10 rounded">
                      <Check size={16} className="text-sage" />
                    </div>
                    <span className="text-sm text-charcoal">
                      {plan.tryon_daily_limit} try-ons per day
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-sage/10 rounded">
                      <Check size={16} className="text-sage" />
                    </div>
                    <span className="text-sm text-charcoal">
                      {plan.recommendation_daily_limit ? `${plan.recommendation_daily_limit} recommendations per day` : 'Unlimited recommendations'}
                    </span>
                  </div>
                  {plan.saved_tryon_monthly_limit > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-sage/10 rounded">
                        <Check size={16} className="text-sage" />
                      </div>
                      <span className="text-sm text-charcoal">
                        {plan.saved_tryon_monthly_limit} saved try-ons per month
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpgrade(plan)}
                  disabled={currentPlan?.code === plan.code || processing}
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    currentPlan?.code === plan.code
                      ? 'bg-warm-gray/20 text-warm-taupe cursor-default'
                      : 'btn-primary hover:shadow-luxury'
                  }`}
                >
                  {currentPlan?.code === plan.code ? (
                    <>
                      <Check size={18} />
                      Current Plan
                    </>
                  ) : processing ? (
                    'Processing...'
                  ) : (
                    <>
                      Upgrade Now
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-charcoal mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. No questions asked.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee for new subscriptions.',
              },
              {
                q: 'Can I upgrade or downgrade?',
                a: 'Of course! Change your plan at any time from your account settings.',
              },
              {
                q: 'Do you store my photos?',
                a: 'We securely store your try-on results. You can delete them anytime.',
              },
            ].map((item, i) => (
              <motion.details
                key={i}
                className="group card-luxury cursor-pointer"
              >
                <motion.summary className="flex items-center justify-between font-semibold text-charcoal">
                  {item.q}
                  <motion.span
                    animate={{ rotate: 0 }}
                    className="group-open:rotate-180 transition-transform"
                  >
                    ↓
                  </motion.span>
                </motion.summary>
                <p className="text-warm-taupe text-sm mt-4">{item.a}</p>
              </motion.details>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
