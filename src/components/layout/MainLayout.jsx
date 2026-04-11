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
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none p-4 lg:p-6 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-full relative"
          >
            <div className="flex-1">
              <Outlet />
            </div>
            
            {/* Elegant, corporate footer */}
            <footer className="mt-12 py-5 border-t border-light-border/40 dark:border-dark-border/40 w-full flex flex-col sm:flex-row items-center justify-between px-2 shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <span className="text-[12px] text-light-textMuted dark:text-dark-textMuted/60 font-medium tracking-wide">
                © {new Date().getFullYear()} Gimnasio ERP. Todos los derechos reservados.
              </span>
              <div className="flex items-center gap-1 mt-2 sm:mt-0">
                <span className="text-[12px] text-light-textMuted dark:text-dark-textMuted/60 font-medium tracking-wide">
                  Powered by
                </span>
                <a 
                  href="https://surazodigital.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[12px] font-semibold tracking-wide text-light-textMuted hover:text-primary dark:text-dark-textMuted/80 dark:hover:text-primary-light transition-colors"
                  title="Visitar Surazo Digital"
                >
                  Surazo Digital
                </a>
              </div>
            </footer>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
