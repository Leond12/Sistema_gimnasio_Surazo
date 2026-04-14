import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, X, Shield, User, Eye, EyeOff, Briefcase, Calculator, ShieldCheck, UserCog, ToggleLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('activos'); // 'todos', 'activos', 'inactivos'
  const [showPassword, setShowPassword] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const { user: currentUser } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${apiUrl}/usuarios.php?action=read`),
        fetch(`${apiUrl}/roles.php?action=read`)
      ]);
      const usersData = await resUsers.json();
      const rolesData = await resRoles.json();
      
      if (usersData.success) {
        // Excluimos la cuenta base de reemplazos técnica
        const filtered = usersData.data.filter(u => u.username !== 'Usuario Eliminado');
        setUsers(filtered);
      }
      if (rolesData.success) setRoles(rolesData.data);
    } catch (e) {
      showAlert('Error conectando con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (user = null) => {
    setShowPassword(false);
    if (user) {
      setFormData(user);
      setEditingId(user.id_usuario);
    } else {
      setFormData({ estado: 1 });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
    setShowPassword(false);
  };

  const confirmSubmit = async () => {
    if (!formData.username || !formData.id_rol) {
      return showAlert('Complete todos los campos requeridos', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Credenciales de acceso actualizadas' : 'Nuevo operador registrado', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error de conexión con el backend', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Salvar cambios en perfil de usuario?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (userToDelete) => {
    if (userToDelete.id_usuario === currentUser.id) {
      return showAlert('No puedes retirar tu propia cuenta mientras estás logueado.', 'error');
    }
    if (userToDelete.username === 'Admin') {
      return showAlert('La cuenta raíz de administración está sellada.', 'error');
    }

    showConfirm(
      `¿Retirar permanentemente a "${userToDelete.username}"? Sus registros pasarán a auditoría del sistema.`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/usuarios.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: userToDelete.id_usuario })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Cuenta de usuario retirada.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'Falla de purga', 'error');
          }
        } catch (e) {
          showAlert('Falla de red', 'error');
        }
      }
    );
  };

  const filteredUsers = users.filter(user => {
    const term = search.toLowerCase();
    const matchesSearch = user.username.toLowerCase().includes(term) || 
                          (user.roles_nombre && user.roles_nombre.toLowerCase().includes(term));
    
    if (filter === 'activos') return parseInt(user.estado) === 1 && matchesSearch;
    if (filter === 'inactivos') return parseInt(user.estado) === 0 && matchesSearch;
    return matchesSearch;
  });

  const getRoleIcon = (roleName) => {
    if (!roleName) return <User className="w-6 h-6" />;
    const normalized = roleName.toLowerCase();
    if (normalized.includes('admin')) return <ShieldCheck className="w-8 h-8 text-primary" />;
    if (normalized.includes('cajer')) return <Calculator className="w-8 h-8 text-primary" />;
    return <Briefcase className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      {/* Header Exotic */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 blur-[80px] -z-10 rounded-full animate-float"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-purple-500/10 blur-2xl -z-10 rounded-full"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-primary dark:from-white dark:to-primary-light tracking-tight">
                Centro de Operadores
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Control de identidades, jerarquías de acceso y sellado de seguridad.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="flex bg-white/40 dark:bg-black/20 p-1 rounded-2xl border border-white/40 dark:border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {['todos', 'activos', 'inactivos'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-2 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filter === f 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Rastrear operador..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Alta Crítica
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <UserCog className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-40" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Base de Usuarios Vacía</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">No encontramos cuentas activas bajo estos parámetros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredUsers.map((user, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.05 }}
                key={user.id_usuario}
                className="glass-card rounded-[2.5rem] p-6 relative group overflow-hidden neon-hover transition-transform duration-300 hover:-translate-y-2 flex flex-col items-center"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${parseInt(user.estado) === 1 ? 'from-primary to-primary-dark' : 'from-red-500 to-red-700'}`} />
                
                <div className="w-full flex justify-end mb-4 pt-2">
                   <div className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border ${parseInt(user.estado) === 1 ? 'text-primary border-primary/20 bg-primary/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                      {parseInt(user.estado) === 1 ? 'STATUS: ACCESS' : 'STATUS: REVOKED'}
                    </div>
                </div>

                <div className="relative mb-6">
                  <div className={`absolute inset-0 rounded-3xl blur-[20px] opacity-30 ${parseInt(user.estado) === 1 ? 'bg-primary' : 'bg-red-500'}`}></div>
                  <div className="relative w-20 h-20 bg-white/50 dark:bg-black/40 rounded-3xl border border-white/40 dark:border-white/10 flex items-center justify-center p-4 shadow-xl">
                    {getRoleIcon(user.roles_nombre)}
                  </div>
                </div>

                <h3 className="text-xl font-black text-light-text dark:text-white tracking-tight truncate w-full mb-1">
                  {user.username}
                </h3>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                  {user.roles_nombre || 'Sin Perfil Autorizado'}
                </p>

                <div className="mt-auto w-full flex gap-3 pt-6 border-t border-white/20 dark:border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(user)} className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-2.5 rounded-2xl transition-all border border-white/40 dark:border-white/10 flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4 ml-1" /> <span className="text-xs">Editar</span>
                  </button>
                  <button onClick={() => handleDelete(user)} className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Exotic Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-md"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  {editingId ? 'Protocolo de Edición' : 'Protocolo de Registro'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Identidad de Acceso</label>
                    <input type="text" name="username" required value={formData.username || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold" />
                  </div>

                  <div className="space-y-2 relative group">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 flex justify-between">
                       Código de Cifrado
                       {editingId && <span className="text-[8px] text-primary">VACÍO = SIN CAMBIOS</span>}
                    </label>
                    <div className="relative">
                       <input type={showPassword ? "text" : "password"} name="password" required={!editingId} value={formData.password || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold pr-12" />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Jerarquía de Rol</label>
                        <select name="id_rol" required value={formData.id_rol || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold appearance-none">
                          <option value="">Clasificar Acceso...</option>
                          {roles.map(r => (
                            <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                          ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Permiso de Operación</label>
                        <select name="estado" required value={formData.estado !== undefined ? formData.estado : 1} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold appearance-none">
                          <option value={1}>Habilitar / Activo</option>
                          <option value={0}>Revocar / Inactivo</option>
                        </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white transition-colors">Cancelar</button>
                <button type="submit" form="user-form" className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1">Salvar Acceso</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Usuarios;
