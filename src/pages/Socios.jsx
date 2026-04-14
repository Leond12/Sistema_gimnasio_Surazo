import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Users, Fingerprint, Mail, Phone, Calendar as CalendarIcon, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/socios.php?action=read`);
      const data = await res.json();
      if (data.success) {
        setSocios(data.data);
      }
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

  const openModal = (socio = null) => {
    if (socio) {
      setFormData(socio);
      setEditingId(socio.id_socio);
    } else {
      setFormData({});
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setEditingId(null);
  };

  const confirmSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.ci) {
      return showAlert('Complete nombre, apellido y CI (Obligatorios)', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/socios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Socio actualizado exitosamente' : 'Socio registrado exitosamente', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'CI duplicado u error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error conectando con el servidor', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Guardar los cambios en el perfil de este socio?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (socio) => {
    showConfirm(
      `¿Retirar al socio "${socio.nombre} ${socio.apellido}" del sistema?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/socios.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: socio.id_socio })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Socio retirado exitosamente.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'Error: No se puede eliminar por dependencias', 'error');
          }
        } catch (e) {
          showAlert('Error conectando con el servidor', 'error');
        }
      }
    );
  };

  const filteredSocios = socios.filter(s => {
    const term = search.toLowerCase();
    return s.nombre.toLowerCase().includes(term) || 
           s.apellido.toLowerCase().includes(term) ||
           s.ci.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header VIP */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-2xl translate-y-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-500 dark:from-white dark:to-gray-400 tracking-tight">
                Membresía Surazo
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Pase V.I.P, perfiles visuales y credenciales de acceso gym.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o CI..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Afiliar Socio
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredSocios.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <Award className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Base de Socios Vacía</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Inicia afiliando a un nuevo integrante al gimnasio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredSocios.map((s, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: (idx % 12) * 0.05, type: 'spring', stiffness: 100 }}
                key={s.id_socio}
                className="glass-card rounded-[2rem] p-6 relative group flex flex-col items-center text-center neon-hover transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative mb-5">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-light relative z-10">
                    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full overflow-hidden flex items-center justify-center border-4 border-white dark:border-dark-surface">
                      <span className="text-3xl font-black text-gray-300 dark:text-gray-600">
                        {s.nombre.charAt(0)}{s.apellido.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-dark-bg dark:bg-white text-white dark:text-black font-black text-[10px] py-1 px-3 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
                    #ID-{s.id_socio.toString().padStart(4, '0')}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-light-text dark:text-white capitalize truncate w-full tracking-tight">
                  {s.nombre.toLowerCase()} {s.apellido.toLowerCase()}
                </h3>

                <div className="flex flex-col gap-2 mt-4 w-full bg-white/30 dark:bg-black/30 p-4 rounded-2xl border border-white/20 dark:border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    <Fingerprint className="w-4 h-4 text-primary opacity-70" />
                    <span className="truncate">{s.ci}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                    <CalendarIcon className="w-4 h-4 text-primary opacity-70" />
                    <span>Inscrito: {s.fecha_registro}</span>
                  </div>
                  {s.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
                      <Phone className="w-4 h-4 text-primary opacity-70" />
                      <span className="truncate">{s.telefono}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 w-full flex gap-3">
                  <button 
                    onClick={() => openModal(s)}
                    className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-2 rounded-xl transition-all shadow-sm border border-white/40 dark:border-white/10 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> <span className="text-xs">Perfil</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(s)}
                    className="flex-none bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 px-3 rounded-xl transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Exotic Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel w-full max-w-xl rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                  {editingId ? 'Actualizar Ficha Socio' : 'Nuevo Registro de Socio'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/30 dark:bg-white/5 p-2 rounded-full hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <form id="soc-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        required
                        value={formData.apellido || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 flex items-center gap-2">
                        <Fingerprint className="w-3 h-3" /> CI / Identidad
                      </label>
                      <input
                        type="text"
                        name="ci"
                        required
                        value={formData.ci || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium"
                    />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-4 bg-white/30 dark:bg-black/20">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors border border-white/40 dark:border-white/5 shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="soc-form"
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white shadow-xl shadow-primary/30 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                  {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Guardar Cambios' : 'Afiliar Socio'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Socios;
