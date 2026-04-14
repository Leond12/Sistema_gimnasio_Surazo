import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Animated Blobs - Radical Upgrade */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-md bg-white/20 dark:bg-black/40 backdrop-blur-[30px] p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 ring-1 ring-white/20"
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 blur-3xl -z-10 animate-pulse"></div>
        
        <div className="text-center mb-10">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white mb-6 p-5 shadow-2xl shadow-primary/40 rotate-12"
          >
            <Dumbbell className="w-full h-full" />
          </motion.div>
          <h1 className="text-5xl font-black text-light-text dark:text-white tracking-tighter">
            SURAZO<span className="text-primary font-light italic">ERP</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] font-black text-gray-500 dark:text-gray-400 mt-4">
            Elite Access Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-5">
            <div className="relative group">
              <label className="absolute -top-2.5 left-5 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-gray-400 z-10 border border-gray-100 dark:border-gray-800">
                Identificador
              </label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 bg-white/40 dark:bg-black/20 border-none rounded-2xl ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative group">
              <label className="absolute -top-2.5 left-5 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-gray-400 z-10 border border-gray-100 dark:border-gray-800">
                Clave Segura
              </label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 bg-white/40 dark:bg-black/20 border-none rounded-2xl ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Desbloquear Sistema
                <LogIn className="w-5 h-5 ml-3" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-10 text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Surazo Fitness Ecosystem &copy; 2026
             </p>
        </div>
      </motion.div>

      <style jsx="true">{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
