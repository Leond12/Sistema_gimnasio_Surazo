import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../../context/AlertContext';

const Header = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/notificaciones.php`);
      const result = await response.json();
      if (result.success) {
        // Formatear campos para el front
        const mapped = result.data.map(n => ({
          id: n.id_notificacion,
          type: n.tipo,
          text: n.texto,
          time: new Date(n.fecha_creacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
          isRead: n.leida == 1
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Opcional: Auto-refresh cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(`${apiUrl}/notificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const removeNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(`${apiUrl}/notificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (id) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await fetch(`${apiUrl}/notificaciones.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id })
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border flex items-center justify-between px-4 lg:px-8 transition-colors duration-300 relative z-[60]">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notificaciones */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500"></span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl border border-light-border dark:border-dark-border overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-gray-800/40">
                  <h3 className="font-semibold text-light-text dark:text-dark-text">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-light-textMuted dark:text-dark-textMuted text-sm">
                      No tienes notificaciones recientes.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif.id)}
                        className={`p-4 cursor-pointer border-b border-light-border/50 dark:border-dark-border/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 group ${!notif.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                          {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <div className="flex-1 pr-2">
                          <p className={`text-sm ${!notif.isRead ? 'text-light-text dark:text-dark-text font-medium' : 'text-light-textMuted dark:text-dark-textMuted'}`}>
                            {notif.text}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                        </div>
                        <button 
                          onClick={(e) => removeNotification(notif.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                          title="Eliminar notificación"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tema */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors overflow-hidden relative"
          aria-label="Toggle Dark Mode"
        >
          <motion.div
            initial={false}
            animate={{ y: isDarkMode ? 30 : 0, opacity: isDarkMode ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-indigo-500" />
          </motion.div>
          
          <motion.div
            initial={false}
            animate={{ y: isDarkMode ? 0 : -30, opacity: isDarkMode ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-500" />
          </motion.div>
        </button>
      </div>
    </header>
  );
};

export default Header;
