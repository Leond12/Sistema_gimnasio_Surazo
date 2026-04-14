import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, CreditCard, ShoppingCart, Activity, Zap, TrendingUp, Calendar } from 'lucide-react';
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
    { label: 'Socios Totales', value: data.socios_activos, icon: Users, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', trend: 'Base de datos activa' },
    { label: 'Pases VIGENTES', value: data.membresias_activas, icon: CreditCard, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20', trend: 'Membresías al día' },
    { label: 'Check-in (Hoy)', value: data.asistencias_hoy, icon: Activity, color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/20', trend: 'Marcajes actuales' },
    { label: 'Ingresos (Hoy)', value: `$${parseFloat(data.ventas_hoy).toFixed(2)}`, icon: ShoppingCart, color: 'from-purple-500 to-fuchsia-600', shadow: 'shadow-purple-500/20', trend: 'Caja del día' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin inline-block w-16 h-16 border-[4px] border-primary border-t-transparent rounded-full shadow-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner Exotic */}
      <div className="glass-panel rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[60px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 border border-primary/20">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-primary">Sistema Operativo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text via-gray-500 to-gray-400 dark:from-white dark:via-gray-300 dark:to-gray-500 tracking-tighter">
              Hola, <span className="text-primary">{user?.username}</span>
            </h1>
            <p className="text-lg text-light-textMuted dark:text-gray-400 mt-3 font-medium max-w-xl">
              Bienvenido al centro de mando de <span className="text-primary font-bold">Surazo Fitness</span>. Aquí tienes el resumen de tracción de hoy.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/40 dark:border-white/10 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="block text-2xl font-black text-light-text dark:text-white">Run</span>
              <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Exotic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className={`glass-panel p-6 rounded-[2rem] border border-white/40 dark:border-white/10 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500 ${stat.shadow}`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} p-3.5 mb-6 text-white shadow-lg`}>
              <stat.icon className="w-full h-full" />
            </div>
            
            <h3 className="text-3xl font-black text-light-text dark:text-white tracking-tighter mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{stat.label}</p>
            
            <div className="mt-5 pt-4 border-t border-white/30 dark:border-white/10 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section Exotic */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-[2.5rem] p-8 border border-white/40 dark:border-white/10"
      >
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-2xl font-black text-light-text dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Rendimiento Semanal
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comparativa de flujo comercial vs asistencia física</p>
          </div>
        </div>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chart_data}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAsistencias" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
              <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dy={15} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} dx={-15} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}
                itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                cursor={{ stroke: '#65a30d', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="ventas" 
                name="Facturación ($)" 
                stroke="#8b5cf6" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorVentas)" 
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="asistencias" 
                name="Asistencias" 
                stroke="#f97316" 
                strokeWidth={5}
                fillOpacity={1} 
                fill="url(#colorAsistencias)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
