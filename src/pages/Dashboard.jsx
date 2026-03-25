import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CreditCard, ShoppingCart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Socios Activos', value: '142', icon: Users, color: 'bg-blue-500', trend: '+12% este mes' },
    { label: 'Membresías', value: '128', icon: CreditCard, color: 'bg-green-500', trend: '+5% este mes' },
    { label: 'Ventas Diarias', value: '$840', icon: ShoppingCart, color: 'bg-purple-500', trend: '+18% este mes' },
    { label: 'Ingresos Mensuales', value: '$12,450', icon: TrendingUp, color: 'bg-orange-500', trend: '+8% este mes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Dashboard</h1>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-1">
            Bienvenido de nuevo, {user?.username}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-soft border border-light-border dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} bg-opacity-90`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-light-text dark:text-dark-text">{stat.value}</h3>
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted mt-1">{stat.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border text-xs text-primary font-medium">
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Decorative empty state indicating future charts */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full h-96 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-light-border dark:border-dark-border flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Vista General de Ingresos</h3>
        <p className="text-light-textMuted dark:text-dark-textMuted max-w-sm">
          Los gráficos detallados de ingresos y retención de usuarios estarán disponibles a medida que se registren más datos en el sistema.
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
