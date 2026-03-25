import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-2 flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full w-2 h-2 bg-primary"></span>
          </span>
        </button>

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
