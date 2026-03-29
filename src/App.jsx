import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Lazy loading pages
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Configuracion = React.lazy(() => import('./pages/Configuracion'));

// Add functional placeholders for the rest of the modules for now
const Socios = React.lazy(() => import('./pages/Socios'));
const Membresias = React.lazy(() => import('./pages/Membresias'));
const Asistencias = React.lazy(() => import('./pages/Asistencias'));
const Clases = React.lazy(() => import('./pages/Clases'));
const Productos = React.lazy(() => import('./pages/Productos'));
const Ventas = React.lazy(() => import('./pages/Ventas'));
const Usuarios = React.lazy(() => import('./pages/Usuarios'));
const Proveedores = React.lazy(() => import('./pages/Proveedores'));
const Maquinaria = React.lazy(() => import('./pages/Maquinaria'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Global Loading Page Fallback
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-light-bg dark:bg-dark-bg text-primary">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes directly under MainLayout */}
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="configuracion" element={<Configuracion />} />
                  
                  {/* Additional Routes will be active once pages are created */}
                  <Route path="socios" element={<Socios />} />
                  <Route path="membresias" element={<Membresias />} />
                  <Route path="asistencias" element={<Asistencias />} />
                  <Route path="clases" element={<Clases />} />
                  <Route path="productos" element={<Productos />} />
                  <Route path="ventas" element={<Ventas />} />
                  <Route path="proveedores" element={<Proveedores />} />
                  <Route path="maquinaria" element={<Maquinaria />} />
                  <Route path="usuarios" element={<Usuarios />} />
                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
