import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/hooks';
import { X } from 'lucide-react';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      default:
        return 'text-blue-300';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="mb-3 pointer-events-auto"
          >
            <div
              className={`glass border rounded-lg px-4 py-3 flex items-center justify-between gap-3 min-w-80 ${getBackgroundColor(
                notif.type
              )}`}
            >
              <p className={`${getTextColor(notif.type)} font-medium`}>
                {notif.message}
              </p>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
