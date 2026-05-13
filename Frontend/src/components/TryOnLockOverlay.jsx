import { motion, AnimatePresence } from 'framer-motion';
import { useTryOnLock } from '@/contexts/TryOnLockContext';

const TryOnLockOverlay = () => {
  const { isTryOnProcessing, tryOnProgress, showCompletionNotification, completionMessage, dismissCompletion } = useTryOnLock();

  return (
    <AnimatePresence>
      {/* Processing Overlay */}
      {isTryOnProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm"
          >
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-transparent border-t-gold-accent border-r-gold-accent rounded-full"
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Generating Your Try-On
              </h3>
              <p className="text-sm text-warm-gray">
                This may take up to 45 minutes. You can navigate elsewhere, but actions are disabled.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-warm-gray/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${tryOnProgress}%` }}
                className="h-full bg-gradient-gold rounded-full"
              />
            </div>

            <p className="text-xs text-warm-gray">{tryOnProgress}% complete</p>
          </motion.div>
        </motion.div>
      )}

      {/* Completion Notification */}
      {showCompletionNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 bg-white rounded-2xl shadow-2xl p-6 z-50 max-w-sm border-l-4 border-gold-accent"
        >
          <div className="flex gap-4 items-start">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <h4 className="font-semibold text-charcoal">{completionMessage}</h4>
              <p className="text-sm text-warm-gray mt-1">Check your Try-On page for results</p>
            </div>
            <button
              onClick={dismissCompletion}
              className="text-warm-gray hover:text-charcoal transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Auto-dismiss after 5 seconds */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 5, ease: 'linear' }}
            onAnimationComplete={dismissCompletion}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-accent origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TryOnLockOverlay;
