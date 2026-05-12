import { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const idRef = useRef(0);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = idRef.current++;
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration = 4000) => {
    return addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration = 4000) => {
    return addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration = 4000) => {
    return addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration = 4000) => {
    return addNotification(message, 'info', duration);
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
