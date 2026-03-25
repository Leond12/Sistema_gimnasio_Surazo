import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />
      
      <div className="flex-1 flex flex-col w-0 overflow-hidden">
        <Header toggleSidebar={toggleMobileSidebar} />
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 lg:p-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
