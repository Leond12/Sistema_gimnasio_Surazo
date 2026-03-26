import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, X, Shield, User, Eye, EyeOff, Briefcase, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Usuarios.css';

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
        // Excluimos desde el frontend a la cuenta base de reemplazos (o lo ideal sería del backend)
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
        showAlert(editingId ? 'Usuario actualizado exitosamente' : 'Usuario registrado exitosamente', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Ocurrió un error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error conectando con el servidor', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Estás seguro de que deseas actualizar los datos de este usuario?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (userToDelete) => {
    if (userToDelete.id_usuario === currentUser.id) {
      return showAlert('Operación denegada. No puedes eliminar tu propia cuenta mientras estás logueado.', 'error');
    }
    if (userToDelete.username === 'Admin') {
      return showAlert('Operación denegada. La cuenta principal de administrador está protegida.', 'error');
    }

    showConfirm(
      `¿Deseas eliminar permanentemente al usuario "${userToDelete.username}"? Todos sus registros vinculados pasarán automáticamente a la papelera del sistema para no perder la coherencia.`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/usuarios.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: userToDelete.id_usuario })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Cuenta eliminada y registros transferidos con éxito.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'Error al eliminar', 'error');
          }
        } catch (e) {
          showAlert('Error conectando con el servidor', 'error');
        }
      }
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) || 
                          (user.roles_nombre && user.roles_nombre.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'activos') return parseInt(user.estado) === 1 && matchesSearch;
    if (filter === 'inactivos') return parseInt(user.estado) === 0 && matchesSearch;
    return matchesSearch;
  });

  const getRoleIcon = (roleName) => {
    if (!roleName) return <User className="w-6 h-6" />;
    const normalized = roleName.toLowerCase();
    if (normalized.includes('admin')) return <Shield className="w-6 h-6" />;
    if (normalized.includes('cajer')) return <Calculator className="w-6 h-6" />;
    return <Briefcase className="w-6 h-6" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Gestión de Usuarios
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-1 ml-11">
            Administra cuentas, valida sus accesos, y gestiona sus credenciales de forma segura.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
          <div className="bg-light-surface dark:bg-dark-surface p-1 rounded-xl flex shadow-sm border border-light-border dark:border-dark-border w-full sm:w-auto">
            {['todos', 'activos', 'inactivos'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`py-2 px-4 rounded-lg text-sm font-semibold capitalize transition-all flex-1 sm:flex-none ${
                  filter === f 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por usuario o rol..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold shadow-soft transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-12 text-center border border-light-border dark:border-dark-border shadow-soft">
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text">No se encontraron usuarios</h3>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-2">Prueba ajustando los filtros de estado o la búsqueda.</p>
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
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                key={user.id_usuario}
                className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 shadow-soft border border-light-border dark:border-dark-border relative group overflow-hidden flex flex-col items-center text-center"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${parseInt(user.estado) === 1 ? 'bg-primary' : 'bg-red-500'}`} />
                
                <div className="w-full flex justify-end mb-2">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    parseInt(user.estado) === 1 
                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {parseInt(user.estado) === 1 ? 'ACTIVO' : 'INACTIVO'}
                  </div>
                </div>

                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-md border-2 border-white dark:border-dark-surface ${parseInt(user.estado) === 1 ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {getRoleIcon(user.roles_nombre)}
                </div>

                <h3 className="text-lg font-bold text-light-text dark:text-dark-text w-full truncate px-2">
                  {user.username}
                </h3>
                <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted mt-1 w-full truncate">
                  {user.roles_nombre || 'Sin Rol Asignado'}
                </p>

                <div className="mt-5 w-full pt-4 border-t border-light-border dark:border-dark-border flex justify-center gap-4">
                  <button 
                    onClick={() => openModal(user)}
                    className="flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(user)}
                    className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeModal}
              className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-light-surface dark:bg-dark-surface w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-light-border dark:border-dark-border relative z-10"
            >
              <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  {editingId ? 'Actualizar Usuario' : 'Registrar Usuario'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white dark:hover:bg-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                      Nombre de Acceso del Sistema
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                      placeholder="Identificador único (Ej: administrador1)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5 flex justify-between">
                      <span>Contraseña de Seguridad</span>
                      {editingId && <span className="text-xs font-normal text-primary">Dejar en blanco mantiene la actual</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required={!editingId}
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        placeholder={editingId ? "Ingresa la nueva contraseña..." : "Al menos 6 caracteres recomendados..."}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Privilegios de Rol
                      </label>
                      <select
                        name="id_rol"
                        required
                        value={formData.id_rol || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="">Selecciona rol...</option>
                        {roles.map(r => (
                          <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Estado de la Cuenta
                      </label>
                      <select
                        name="estado"
                        required
                        value={formData.estado !== undefined ? formData.estado : 1}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value={1}>Activo (Acceso Permitido)</option>
                        <option value={0}>Inactivo (Acceso Bloqueado)</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl font-bold text-light-textMuted dark:text-dark-textMuted hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="user-form"
                  className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Confirmar y Guardar' : 'Crear Cuenta'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Usuarios;
