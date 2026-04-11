import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CreditCard, ShoppingCart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAlert } from '../context/AlertContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [data, setData] = useState({
    socios_activos: 0,
    membresias_activas: 0,
    ventas_hoy: 0,
    asistencias_hoy: 0,
    chart_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/dashboard.php`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          showAlert(result.error || 'Error al cargar datos del dashboard', 'error');
        }
      } catch (error) {
        showAlert('Error de conexión con el servidor', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total de Socios', value: data.socios_activos, icon: Users, color: 'bg-blue-500', trend: 'Actualizado ahora' },
    { label: 'Membresías Activas', value: data.membresias_activas, icon: CreditCard, color: 'bg-green-500', trend: 'Actualizado ahora' },
    { label: 'Asistencias (Hoy)', value: data.asistencias_hoy, icon: Activity, color: 'bg-orange-500', trend: 'Tiempo real' },
    { label: 'Ventas (Hoy)', value: `$${parseFloat(data.ventas_hoy).toFixed(2)}`, icon: ShoppingCart, color: 'bg-purple-500', trend: 'Tiempo real' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin inline-block w-12 h-12 border-[4px] border-current border-t-transparent text-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Dashboard Principal</h1>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-1">
            Resumen en tiempo real del estado del gimnasio. Bienvenido, <span className="font-semibold text-primary">{user?.username}</span>.
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
            className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-soft border border-light-border dark:border-dark-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Background glowing effect */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color} bg-opacity-90 shadow-md`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-light-text dark:text-dark-text">{stat.value}</h3>
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted mt-1">{stat.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border/50 dark:border-dark-border/50 flex items-center gap-2 relative z-10">
              <div className={`w-2 h-2 rounded-full ${stat.color} animate-pulse`} />
              <span className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium">
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-light-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-light-border dark:border-dark-border p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text">Rendimiento Semanal</h3>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-1">Comparativa de ingresos y afluencia de los últimos 7 días</p>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.chart_data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="ventas" 
                name="Ventas ($)" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVentas)" 
                animationDuration={1500}
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="asistencias" 
                name="Asistencias" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAsistencias)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
