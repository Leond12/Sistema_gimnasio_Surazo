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
      
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-light/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-primary-dark/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-4"
          >
            <Dumbbell className="w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            GYM<span className="text-primary">ERP</span>
          </h1>
          <p className="text-sm text-light-textMuted dark:text-dark-textMuted mt-2">
            Ingresa a tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Usuario
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Iniciar Sesión
                <LogIn className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </form>
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
