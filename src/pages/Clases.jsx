import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Calendar as Cal, Users, Clock, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
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
      const [resClases, resUsr] = await Promise.all([
        fetch(`${apiUrl}/clases.php?action=read`),
        fetch(`${apiUrl}/usuarios.php?action=read`)
      ]);
      const dataC = await resClases.json();
      const dataU = await resUsr.json();
      
      if (dataC.success) setClases(dataC.data);
      if (dataU.success) {
        // Filtrar solo usuarios activos para el selector de instructores
        const actUser = dataU.data.filter(u => parseInt(u.estado) === 1);
        setUsuarios(actUser);
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

  const openModal = (cls = null) => {
    if (cls) {
      setFormData(cls);
      setEditingId(cls.id_clase);
    } else {
      setFormData({ cupo_maximo: 20 });
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
    if (!formData.nombre_clase || !formData.id_instructor) {
      return showAlert('Selecciona al instructor responsable y añade un nombre de rutina', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { ...formData, action };
      
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/clases.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Sala actualizada' : 'Actividad generada exitosamente', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Operación abortada por la DB', 'error');
      }
    } catch (e) {
      showAlert('El servidor desestimó la petición', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Salvar estos cambios organizativos en la clase?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (cls) => {
    showConfirm(
      `¿Erradicar la clase "${cls.nombre_clase}" de forma permanente del horario?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/clases.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: cls.id_clase })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Actividad retirada del grid.', 'success');
            fetchData();
          } else {
            showAlert('Reservas ligadas imposibilitan removerla.', 'error');
          }
        } catch (e) {
          showAlert('Error interno de comunicación.', 'error');
        }
      }
    );
  };

  const filterClases = clases.filter(c => {
    const term = search.toLowerCase();
    const nc = c.nombre_clase?.toLowerCase() || '';
    const ni = c.instructor_nombre?.toLowerCase() || '';
    return nc.includes(term) || ni.includes(term);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 dark:bg-orange-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Cal className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-orange-500 dark:from-white dark:to-orange-400 tracking-tight">
                Cronograma de Clases
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Sincronización de rutinas dinámicas dictadas por los entrenadores.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Indagar por clase o profe..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-orange-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-orange-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Agendar Sesión
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        </div>
      ) : filterClases.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <Flame className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Calendario Despejado</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Define una nueva actividad aeróbica o general usando el botón superior.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filterClases.map((c, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.05, type: 'spring' }}
                key={c.id_clase}
                className="glass-card rounded-[2rem] p-6 relative group flex flex-col justify-between items-start transition-transform hover:-translate-y-2 border-t-4 border-t-orange-500 shadow-xl shadow-orange-500/5 dark:shadow-none"
              >
                <div className="flex justify-between w-full items-start mb-2">
                  <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 p-2.5 rounded-xl border border-orange-500/20">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-black px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/50 dark:border-gray-700">
                    <Users className="w-3 h-3"/> Cupo: {c.cupo_maximo}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-light-text dark:text-white mt-2 w-full break-words leading-tight tracking-tight">
                  {c.nombre_clase}
                </h3>
                
                <div className="w-full mt-5 bg-white/50 dark:bg-black/30 p-3.5 rounded-2xl flex flex-col gap-2 border border-white/40 dark:border-white/5">
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-bold bg-white dark:bg-black/50 px-3 py-1.5 rounded-lg shadow-sm">
                    <Cal className="w-4 h-4 text-orange-500" /> {c.horario_inicio ? c.horario_inicio.replace('T', ' - ').replace(':00', '') : 'Horario a definir'}
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-bold px-1 ml-1">
                    <span className="bg-orange-500 w-2 h-2 rounded-full"></span> Coach: {c.instructor_nombre || 'No asignado'}
                  </span>
                </div>

                <div className="mt-5 w-full flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2">
                  <button onClick={() => openModal(c)} className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-2.5 rounded-xl transition-all shadow-sm border border-white/40 dark:border-white/10 flex items-center justify-center gap-2 text-sm">
                    Reagendar
                  </button>
                  <button onClick={() => handleDelete(c)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20 shadow-sm">
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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel w-full max-w-lg rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl text-white shadow-lg">
                    <Flame className="w-6 h-6" />
                  </span>
                  {editingId ? 'Editor de Clase' : 'Publicar Sesión'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/30 dark:bg-white/5 p-2 rounded-full hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <form id="cls-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                      Nombre Comercial de la Clase *
                    </label>
                    <input type="text" name="nombre_clase" required value={formData.nombre_clase || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white shadow-inner font-medium" placeholder="Ej: Zumba Turbo, Crossfit N3..."/>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                        Instructor Encargado *
                      </label>
                      <select name="id_instructor" required value={formData.id_instructor || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white shadow-inner font-medium appearance-none">
                        <option value="">Selecciona al Coach...</option>
                        {usuarios.map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>{u.username}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                        Cupo Total Permitido
                      </label>
                      <input type="number" name="cupo_maximo" required min="1" value={formData.cupo_maximo || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white shadow-inner font-medium"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Cronograma (Fecha y Hora)
                    </label>
                    <input type="datetime-local" name="horario_inicio" value={formData.horario_inicio || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white shadow-inner font-medium"/>
                  </div>

                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/30">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors shadow-sm">
                  Cerrar
                </button>
                <button type="submit" form="cls-form" className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:to-orange-400 text-white shadow-xl shadow-orange-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1">
                  Repertir al Schedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clases;
