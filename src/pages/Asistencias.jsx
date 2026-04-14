import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, X, Activity, UserCheck, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Asistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
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
      const [resAsist, resSocios] = await Promise.all([
        fetch(`${apiUrl}/asistencias.php?action=read`),
        fetch(`${apiUrl}/socios.php?action=read`)
      ]);
      const dataA = await resAsist.json();
      const dataS = await resSocios.json();
      
      if (dataA.success) setAsistencias(dataA.data);
      if (dataS.success) setSocios(dataS.data);
    } catch (e) {
      showAlert('Error conectando con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh mechanism omitted for performance, but can be added via setInterval
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (asist = null) => {
    if (asist) {
      // Formato para input datetime-local: YYYY-MM-DDTHH:MM
      const dateVal = asist.fecha_hora ? asist.fecha_hora.replace(' ', 'T') : '';
      setFormData({ ...asist, fecha_hora: dateVal });
      setEditingId(asist.id_asistencia);
    } else {
      // Pre-fill local aware timezone
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
      setFormData({ fecha_hora: localISOTime });
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
    if (!formData.id_socio) {
      return showAlert('Debes apuntar al socio que asiste', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      
      // Adaptar T para Mysql datetime format
      if (payload.fecha_hora) {
        payload.fecha_hora = payload.fecha_hora.replace('T', ' ');
      }

      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/asistencias.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Pase actualizado' : 'Marcada generada exitosamente', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en validación', 'error');
      }
    } catch (e) {
      showAlert('Fallo el enlace remoto.', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Actualizar esta marca temporal en la base de datos?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (asist) => {
    showConfirm(
      `¿Borrar esta marca de asistencia de ${asist.nombre}?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/asistencias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: asist.id_asistencia })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Registro extirpado.', 'success');
            fetchData();
          } else {
            showAlert('Denegación de borrado', 'error');
          }
        } catch (e) {
          showAlert('Conectividad nula', 'error');
        }
      }
    );
  };

  const filterAssists = asistencias.filter(a => {
    const term = search.toLowerCase();
    const nf = a.nombre?.toLowerCase() || '';
    const af = a.apellido?.toLowerCase() || '';
    const df = a.ci?.toLowerCase() || '';
    return nf.includes(term) || af.includes(term) || df.includes(term);
  });

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-primary/20 dark:bg-primary/5 rounded-full blur-[50px] translate-y-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Activity className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-blue-500 dark:from-white dark:to-blue-400 tracking-tight">
                Flujo de Asistencias
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Monitoreo en tiempo real del check-in de los socios a la sede.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Filtrar marcajes..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Fichar Check-in
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filterAssists.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <UserCheck className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Ausencia temporal de actividad</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">No se registran marcas de ingresos por el momento.</p>
        </div>
      ) : (
        <div className="relative max-w-4xl mx-auto pl-4 sm:pl-0">
          {/* Vertical TimeLine core */}
          <div className="absolute left-8 sm:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-blue-400 to-transparent opacity-30 transform sm:-translate-x-1/2 rounded-full"></div>
          
          <div className="space-y-8">
            <AnimatePresence>
              {filterAssists.map((a, idx) => {
                const dateObj = new Date(a.fecha_hora);
                const day = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isLeft = idx % 2 === 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 50, x: isLeft ? -50 : 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: Math.min(idx * 0.1, 1) }}
                    key={a.id_asistencia}
                    className={`relative flex items-center justify-between w-full p-2 group ${isLeft ? 'sm:flex-row-reverse' : ''}`}
                  >
                    {/* Ghost node bridging gap */}
                    <div className="hidden sm:block w-5/12"></div>
                    
                    {/* The Timline Dot Bubble */}
                    <div className="absolute left-8 sm:left-1/2 w-8 h-8 rounded-full bg-white dark:bg-black border-4 border-primary shadow-[0_0_15px_rgba(101,163,13,0.5)] transform -translate-x-1/2 z-10 flex flex-col justify-center items-center">
                       <Activity className="w-3 h-3 text-primary" />
                    </div>

                    <div className="w-full sm:w-5/12 ml-12 sm:ml-0 glass-card rounded-2xl p-5 shadow-lg border border-white/40 dark:border-white/10 hover:shadow-primary/20 transition-all hover:-translate-y-2 relative overflow-hidden">
                      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500 left-0"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black tracking-widest text-primary dark:text-primary-light bg-primary/10 px-2 py-1 rounded-md">
                          {time}
                        </span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {day}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-light-text dark:text-white mt-3">
                        {a.nombre || 'Desconocido'} {a.apellido || ''}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                        CI: {a.ci || 'Sin registrar'}
                      </p>

                      <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(a)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(a)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Exotic Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-br from-blue-400 to-primary rounded-xl text-white shadow-lg">
                    <UserCheck className="w-6 h-6" />
                  </span>
                  {editingId ? 'Reparar Marcaje' : 'Registrar Ingreso'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/30 dark:bg-white/5 p-2 rounded-full hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <form id="ast-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                      Miembro Accediendo *
                    </label>
                    <select
                      name="id_socio"
                      required
                      value={formData.id_socio || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium appearance-none"
                    >
                      <option value="">Selecciona al titular del pase...</option>
                      {socios.map(s => (
                        <option key={s.id_socio} value={s.id_socio}>
                          {s.nombre} {s.apellido} - {s.ci}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Instante de Marcaje
                    </label>
                    <input
                      type="datetime-local"
                      name="fecha_hora"
                      value={formData.fecha_hora || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-medium"
                    />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/30">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                  Omitir
                </button>
                <button 
                  type="submit" 
                  form="ast-form"
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-primary hover:to-primary-dark text-white shadow-xl shadow-primary/30 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                  <UserCheck className="w-5 h-5" />
                  {editingId ? 'Salvar Error' : 'Confirmar Pase'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Asistencias;
