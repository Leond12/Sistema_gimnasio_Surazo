import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // type = 'success' | 'error' | 'warning' | 'info'
  const showAlert = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => removeAlert(id), duration);
    }
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Use confirmDialog for action confirmations replacing window.confirm()
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  const showConfirm = useCallback((message, onConfirm, onCancel) => {
    setConfirmDialog({ message, onConfirm, onCancel });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog && confirmDialog.onConfirm) confirmDialog.onConfirm();
    closeConfirm();
  }, [confirmDialog, closeConfirm]);

  const handleCancel = useCallback(() => {
    if (confirmDialog && confirmDialog.onCancel) confirmDialog.onCancel();
    closeConfirm();
  }, [confirmDialog, closeConfirm]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {/* Toast Alerts Overlay */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {alerts.map(alert => (
            <AlertToast key={alert.id} alert={alert} onClose={() => removeAlert(alert.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm Popup Overlay */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-dark-bg/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-light-surface dark:bg-dark-surface w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-light-border dark:border-dark-border"
            >
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="text-yellow-500 w-12 h-12" />
                </div>
                <h3 className="text-center text-lg font-bold text-light-text dark:text-dark-text mb-2">
                  Confirmación requerida
                </h3>
                <p className="text-center text-light-textMuted dark:text-dark-textMuted mb-6">
                  {confirmDialog.message}
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg font-medium text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark shadow-soft transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};

const AlertToast = ({ alert, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const borders = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`min-w-[280px] max-w-sm overflow-hidden bg-light-surface dark:bg-dark-surface shadow-soft border border-light-border dark:border-dark-border rounded-lg border-l-4 ${borders[alert.type] || borders.info} flex items-start p-4 gap-3`}
    >
      <div className="shrink-0 mt-0.5">{icons[alert.type] || icons.info}</div>
      <div className="flex-1 text-sm font-medium text-light-text dark:text-dark-text leading-tight pt-1">
        {alert.message}
      </div>
      <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
