import React, { useEffect } from 'react';

/**
 * Toast Component - Shows notifications at the top of the screen
 * Types: success, error, warning, info
 */
export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    info: 'bg-gradient-to-r from-blue-500 to-blue-600'
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[type];

  return (
    <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-down backdrop-blur-sm border border-white/20`}>
      <span className="text-2xl font-bold">{icon}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
};

/**
 * ToastContainer - Manages multiple toasts
 * Usage: <ToastContainer ref={toastRef} />
 * Then call: toastRef.current?.show('Message', 'success')
 */
export const useToast = () => {
  const [toasts, setToasts] = React.useState([]);

  const show = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const ToastContainer = () => (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );

  return { show, ToastContainer };
};
