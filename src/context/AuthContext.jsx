import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    // Check locally saved session
    const storedUser = localStorage.getItem('gym_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Hardcoded Admin Backdoor for testing
    if (username === 'Admin' && password === 'Admin123') {
      const adminUser = { id: 0, username: 'Admin', fk_role: 1, nombre_rol: 'Administrador' };
      setUser(adminUser);
      localStorage.setItem('gym_user_session', JSON.stringify(adminUser));
      showAlert('Bienvenido Administrador', 'success');
      return { success: true };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('gym_user_session', JSON.stringify(data.user));
        showAlert(`Bienvenido ${data.user.username}`, 'success');
        return data;
      } else {
        showAlert(data.error || 'Credenciales incorrectas', 'error');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error(error);
      showAlert('Error conectando con el servidor', 'error');
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym_user_session');
    showAlert('Sesión finalizada', 'info');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
