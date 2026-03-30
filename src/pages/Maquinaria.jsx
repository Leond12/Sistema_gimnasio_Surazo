import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Wrench, Activity, Clock, ServerOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Maquinaria.css';

const Maquinaria = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas'); // 'todas', 'activa', 'mantenimiento', 'inactiva'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ estado: 'activa' });
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMaq, resTipos] = await Promise.all([
        fetch(`${apiUrl}/maquinaria.php?action=read`),
        fetch(`${apiUrl}/maquinaria_tipos.php?action=read`)
      ]);
      const maqData = await resMaq.json();
      const tiposData = await resTipos.json();
      
      if (maqData.success) {
        setMaquinas(maqData.data);
      }
      if (tiposData.success) {
        setTipos(tiposData.data);
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

  const openModal = (maq = null) => {
    if (maq) {
      setFormData(maq);
      setEditingId(maq.id_maquina);
    } else {
      setFormData({ estado: 'activa' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ estado: 'activa' });
    setEditingId(null);
  };

  const confirmSubmit = async () => {
    if (!formData.nombre_maquina || !formData.id_tipo) {
      return showAlert('Complete nombre y tipo de máquina', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/maquinaria.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Máquina actualizada' : 'Máquina registrada', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error conectando con el servidor', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Estás seguro de actualizar el estado/datos de la máquina?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (maq) => {
    showConfirm(
      `¿Desea dar de baja permanentemente a "${maq.nombre_maquina}" del inventario?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/maquinaria.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: maq.id_maquina })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Equipo eliminado del sistema.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'Error al eliminar', 'error');
          }
        } catch (e) {
          showAlert('Comprobación fallida, verifique su red', 'error');
        }
      }
    );
  };

  const filteredMaquinas = maquinas.filter(m => {
    const matchesSearch = m.nombre_maquina.toLowerCase().includes(search.toLowerCase()) || 
                          (m.tipo_nombre && m.tipo_nombre.toLowerCase().includes(search.toLowerCase()));
    
    if (filter === 'todas') return matchesSearch;
    return m.estado === filter && matchesSearch;
  });

  const getStatusAppearance = (estado) => {
    switch (estado) {
      case 'activa': return { color: 'green', text: 'OPERATIVA', icon: <Activity className="w-5 h-5 text-green-500 dark:text-green-400" /> };
      case 'mantenimiento': return { color: 'yellow', text: 'REPARACIÓN', icon: <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" /> };
      case 'inactiva': return { color: 'red', text: 'AVERÍA / INACTIVA', icon: <ServerOff className="w-5 h-5 text-red-500 dark:text-red-400" /> };
      default: return { color: 'gray', text: estado, icon: <Wrench className="w-5 h-5 text-gray-500" /> };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Control de Maquinaria
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-1 ml-11">
            Gestión de equipos operativos, rastreo de mantenimientos y daños.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
          <div className="bg-light-surface dark:bg-dark-surface p-1 rounded-xl flex shadow-sm border border-light-border dark:border-dark-border w-full sm:w-auto overflow-x-auto">
            {['todas', 'activa', 'mantenimiento', 'inactiva'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-light-textMuted dark:text-dark-textMuted hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {f === 'mantenimiento' ? 'Mantenimiento' : f}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar máquina o tipo..." 
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
            Registrar Equipo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredMaquinas.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-12 text-center border border-light-border dark:border-dark-border shadow-soft">
          <Wrench className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text">No hay maquinaria registrada</h3>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-2">Registra un nuevo equipo usando el botón superior para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMaquinas.map((m, idx) => {
              const st = getStatusAppearance(m.estado);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: (idx % 10) * 0.05 }}
                  key={m.id_maquina}
                  className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-soft border border-light-border dark:border-dark-border relative group overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${st.color === 'red' ? 'bg-red-500' : st.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className={`p-2.5 rounded-xl flex items-center justify-center border-2 border-white dark:border-dark-bg shadow-sm ${
                      st.color === 'red' ? 'bg-red-100 dark:bg-red-900/40' : 
                      st.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/40' : 
                      'bg-green-100 dark:bg-green-900/40'
                    }`}>
                      {st.icon}
                    </div>
                    
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                      st.color === 'red' ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40' : 
                      st.color === 'yellow' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/40' : 
                      'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/40'
                    }`}>
                      {st.text}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text truncate">
                    {m.nombre_maquina}
                  </h3>
                  <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">
                    {m.tipo_nombre || 'General'}
                  </p>

                  <div className="mt-4 bg-gray-50/50 dark:bg-gray-800/30 p-2.5 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-light-textMuted dark:text-dark-textMuted font-semibold">Adquirido:</span>
                      <span className="text-light-text dark:text-dark-text font-bold">{m.fecha_adquisicion || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-light-textMuted dark:text-dark-textMuted font-semibold">Mantenimiento:</span>
                      <span className="text-light-text dark:text-dark-text font-bold">{m.ultimo_mantenimiento || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-1 flex justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(m)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-semibold"
                    >
                      <Edit className="w-4 h-4" /> 
                    </button>
                    <button 
                      onClick={() => handleDelete(m)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
                  <Wrench className="w-6 h-6 text-primary" />
                  {editingId ? 'Gestión de Máquina' : 'Nueva Máquina'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white dark:hover:bg-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <form id="maq-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Nombre de Máquina
                      </label>
                      <input
                        type="text"
                        name="nombre_maquina"
                        required
                        value={formData.nombre_maquina || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        placeholder="Ej. Cinta de Correr Pro"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Tipo de Máquina
                      </label>
                      <select
                        name="id_tipo"
                        required
                        value={formData.id_tipo || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="">Seleccione Categoría</option>
                        {tipos.map(t => (
                          <option key={t.id_tipo} value={t.id_tipo}>{t.nombre_tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Estado Actual
                      </label>
                      <select
                        name="estado"
                        required
                        value={formData.estado || 'activa'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white appearance-none"
                      >
                        <option value="activa">Operativa / Activa</option>
                        <option value="mantenimiento">En Mantenimiento</option>
                        <option value="inactiva">Dañada / Inactiva</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Ingreso (Opcional)
                      </label>
                      <input
                        type="date"
                        name="fecha_adquisicion"
                        value={formData.fecha_adquisicion || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Mantenimiento (Opccional)
                      </label>
                      <input
                        type="date"
                        name="ultimo_mantenimiento"
                        value={formData.ultimo_mantenimiento || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Observaciones adicionales
                      </label>
                      <textarea
                        name="observaciones"
                        value={formData.observaciones || ''}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                        placeholder="Detalles sobre el uso, fallas o reparaciones conjuntas..."
                      />
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
                  form="maq-form"
                  className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Guardar Cambios' : 'Registrar Equipo'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maquinaria;
