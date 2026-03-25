import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Dumbbell, Users, CreditCard, Calendar, 
  Package, ShoppingCart, Settings, LogOut, CheckSquare
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobile }) => {
  const { logout, user } = useAuth();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Dumbbell },
    { path: '/socios', label: 'Socios', icon: Users },
    { path: '/membresias', label: 'Membresías', icon: CreditCard },
    { path: '/asistencias', label: 'Asistencias', icon: CheckSquare },
    { path: '/clases', label: 'Clases', icon: Calendar },
    { path: '/productos', label: 'Productos', icon: Package },
    { path: '/ventas', label: 'Ventas', icon: ShoppingCart },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  const baseClasses = "fixed inset-y-0 left-0 z-50 w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto";
  const mobileClasses = isMobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      <aside className={`${baseClasses} ${mobileClasses} flex flex-col`}>
        <div className="flex items-center justify-center h-16 border-b border-light-border dark:border-dark-border px-4">
          <Dumbbell className="w-8 h-8 text-primary mr-2" />
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-wider mt-1">
            GYM<span className="text-primary">ERP</span>
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                  : 'text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-light-text dark:hover:text-dark-text'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold mr-3">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-col overflow-hidden text-sm">
              <p className="font-semibold text-light-text dark:text-dark-text truncate">{user?.username}</p>
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted">{user?.nombre_rol || 'Admin'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-dark-bg/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}
    </>
  );
};

export default Sidebar;
