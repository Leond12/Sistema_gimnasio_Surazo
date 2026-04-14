import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Wrench, Activity, Clock, ServerOff, Settings, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      if (maqData.success) setMaquinas(maqData.data);
      if (tiposData.success) setTipos(tiposData.data);
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
        showAlert(editingId ? 'Equipo actualizado' : 'Equipo registrado', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error de conexión', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Actualizar registros técnicos de la máquina?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (maq) => {
    showConfirm(
      `¿Retirar "${maq.nombre_maquina}" definitivamente?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/maquinaria.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: maq.id_maquina })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Equipo eliminado.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'No se puede eliminar', 'error');
          }
        } catch (e) {
          showAlert('Error de conexión', 'error');
        }
      }
    );
  };

  const filteredMaquinas = maquinas.filter(m => {
    const term = search.toLowerCase();
    const matchesSearch = m.nombre_maquina.toLowerCase().includes(term) || 
                          (m.tipo_nombre && m.tipo_nombre.toLowerCase().includes(term));
    if (filter === 'todas') return matchesSearch;
    return m.estado === filter && matchesSearch;
  });

  const getStatusAppearance = (estado) => {
    switch (estado) {
      case 'activa': return { color: 'from-green-500 to-emerald-600', text: 'OPERATIVA', icon: <Activity className="w-6 h-6 text-green-500" /> };
      case 'mantenimiento': return { color: 'from-orange-400 to-orange-600', text: 'REPARACIÓN', icon: <Clock className="w-6 h-6 text-orange-500" /> };
      case 'inactiva': return { color: 'from-red-500 to-red-700', text: 'AVERÍA', icon: <ServerOff className="w-6 h-6 text-red-500" /> };
      default: return { color: 'from-gray-400 to-gray-600', text: estado, icon: <Settings className="w-6 h-6 text-gray-400" /> };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      {/* Header Exotic */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[80px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 blur-2xl -z-10 rounded-full translate-y-1/2"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Wrench className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-primary dark:from-white dark:to-primary-light tracking-tight">
                Ingeniería Deportiva
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Monitoreo de equipos, estados técnicos y reportes de averías.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
             <div className="flex bg-white/40 dark:bg-black/20 p-1 rounded-2xl border border-white/40 dark:border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {['todas', 'activa', 'mantenimiento', 'inactiva'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-2 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {f === 'mantenimiento' ? 'Mantenimiento' : f}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Rastrear equipo..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/30 transition-all hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              Alta de Equipo
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredMaquinas.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <ServerOff className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-40" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Sin Equipos en Radar</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">No hemos localizado maquinaria con los filtros actuales.</p>
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
                  transition={{ duration: 0.3, delay: (idx % 12) * 0.05 }}
                  key={m.id_maquina}
                  className="glass-card rounded-[2.5rem] p-6 relative group overflow-hidden neon-hover transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${st.color}`} />
                  
                  <div className="flex justify-between items-start mb-6 pt-2">
                    <div className="p-3 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/30 dark:border-white/5 shadow-sm">
                      {st.icon}
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/40 dark:border-white/10 ${
                       m.estado === 'activa' ? 'bg-green-500/10 text-green-500' :
                       m.estado === 'mantenimiento' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {st.text}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-light-text dark:text-white truncate mb-1 tracking-tight">
                    {m.nombre_maquina}
                  </h3>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                    {m.tipo_nombre || 'Categoría General'}
                  </p>
                  
                  <div className="bg-white/30 dark:bg-black/20 rounded-3xl p-5 border border-white/20 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="flex items-center gap-1.5 font-bold text-gray-400">
                         <Calendar className="w-3.5 h-3.5 text-primary" /> Adquisición
                       </span>
                       <span className="font-black text-light-text dark:text-white">{m.fecha_adquisicion || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="flex items-center gap-1.5 font-bold text-gray-400">
                         <Clock className="w-3.5 h-3.5 text-primary" /> Última Rev.
                       </span>
                       <span className="font-black text-light-text dark:text-white">{m.ultimo_mantenimiento || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-primary/5 rounded-xl border border-primary/10">
                       <Info className="w-4 h-4 text-primary" title={m.observaciones || 'Sin notas'} />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(m)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(m)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Exotic Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-md"/>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary" />
                  {editingId ? 'Reporte Técnico' : 'Alta de Activo'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <form id="maq-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Nombre del Equipo</label>
                       <input type="text" name="nombre_maquina" required value={formData.nombre_maquina || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Estatus Operativo</label>
                        <select name="estado" required value={formData.estado || 'activa'} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold appearance-none">
                          <option value="activa">Operativa / Activa</option>
                          <option value="mantenimiento">Mantenimiento</option>
                          <option value="inactiva">Avería Crítica</option>
                        </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Categoría</label>
                        <select name="id_tipo" required value={formData.id_tipo || ''} onChange={handleInputChange} className="w-full px-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-bold appearance-none">
                          <option value="">Clasificar...</option>
                          {tipos.map(t => (
                            <option key={t.id_tipo} value={t.id_tipo}>{t.nombre_tipo}</option>
                          ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Alta</label>
                        <input type="date" name="fecha_adquisicion" value={formData.fecha_adquisicion || ''} onChange={handleInputChange} className="w-full px-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Rev.</label>
                        <input type="date" name="ultimo_mantenimiento" value={formData.ultimo_mantenimiento || ''} onChange={handleInputChange} className="w-full px-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Bitácora de Observaciones</label>
                    <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleInputChange} rows="2" className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium resize-none" />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white transition-colors">Cancelar</button>
                <button type="submit" form="maq-form" className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1">Guardar Registro</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maquinaria;
