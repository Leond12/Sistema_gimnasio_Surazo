import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, CreditCard, Clock, CheckCircle, AlertTriangle, Calendar, Award, User, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Membresias = () => {
  const [membresias, setMembresias] = useState([]);
  const [socios, setSocios] = useState([]);
  const [planes, setPlanes] = useState([]);
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
      const [mRes, sRes, pRes] = await Promise.all([
        fetch(`${apiUrl}/membresias.php?action=read`),
        fetch(`${apiUrl}/socios.php?action=read`),
        fetch(`${apiUrl}/planes.php?action=read`)
      ]);
      const dataM = await mRes.json();
      const dataS = await sRes.json();
      const dataP = await pRes.json();

      if (dataM.success) setMembresias(dataM.data);
      if (dataS.success) setSocios(dataS.data);
      if (dataP.success) setPlanes(dataP.data);
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
    
    // Auto-calculate expiration date based on plan duration
    if (name === 'id_plan' || name === 'fecha_inicio') {
      let finalFd = { ...formData, [name]: value };
      
      const planValue = name === 'id_plan' ? value : finalFd.id_plan;
      const startValue = name === 'fecha_inicio' ? value : finalFd.fecha_inicio;
      
      if (planValue && startValue && planes.length > 0) {
        const planObj = planes.find(p => p.id_plan == planValue);
        if (planObj) {
          const startDate = new Date(startValue);
          startDate.setDate(startDate.getDate() + parseInt(planObj.duracion_dias));
          finalFd.fecha_vencimiento = startDate.toISOString().split('T')[0];
        }
      }
      setFormData(finalFd);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (mem = null) => {
    if (mem) {
      setFormData(mem);
      setEditingId(mem.id_membresia);
    } else {
      setFormData({ estado: 'activa', fecha_inicio: new Date().toISOString().split('T')[0] });
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
    if (!formData.id_socio || !formData.id_plan || !formData.fecha_inicio || !formData.fecha_vencimiento) {
      return showAlert('Complete todos los campos obligatorios.', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/membresias.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Suscripción actualizada' : 'Suscripción activada', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error de red durante la comunicación.', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      showConfirm('¿Guardar los cambios a esta suscripción?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (mem) => {
    showConfirm(
      `¿Cancelar y eliminar definitivamente la suscripción de ${mem.socio_nombre || 'este socio'}?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/membresias.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: mem.id_membresia })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Suscripción eliminada.', 'success');
            fetchData();
          } else {
            showAlert(result.error || 'No se puede eliminar la membresía.', 'error');
          }
        } catch (e) {
          showAlert('Error de conectividad', 'error');
        }
      }
    );
  };

  const filteredM = membresias.filter(m => {
    const term = search.toLowerCase();
    return (m.socio_nombre && m.socio_nombre.toLowerCase().includes(term)) || 
           (m.plan_nombre && m.plan_nombre.toLowerCase().includes(term));
  });

  const getProgressState = (inicio, fin, estado) => {
    const today = new Date();
    const startDate = new Date(inicio);
    const endDate = new Date(fin);
    
    let total = endDate - startDate;
    let current = today - startDate;
    let percent = Math.min(Math.max((current / total) * 100, 0), 100);
    let remainingDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    if (estado === 'vencida' || remainingDays < 0) {
      return { p: 100, color: 'from-red-500 to-red-700', text: 'bg-red-500/10 text-red-500 border-red-500/20', msg: 'VENCIDA', days: 0 };
    }
    if (estado === 'pausada') {
      return { p: percent, color: 'from-gray-400 to-gray-600', text: 'bg-gray-500/10 text-gray-500 border-gray-500/20', msg: 'PAUSADA', days: remainingDays };
    }
    if (remainingDays <= 5) {
      return { p: percent, color: 'from-yellow-400 to-orange-500', text: 'bg-orange-500/10 text-orange-500 border-orange-500/20', msg: 'POR VENCER', days: remainingDays };
    }
    return { p: percent, color: 'from-primary-light to-primary-dark', text: 'bg-primary/10 text-primary border-primary/20', msg: 'ACTIVA', days: remainingDays };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Exotic */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-10 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-2xl translate-y-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <CreditCard className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-gray-500 dark:from-white dark:to-gray-400 tracking-tight">
                Membresías VIP
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Pases de acceso, control de planes y vigencia en tiempo real.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar socio o plan..." 
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
              Nuevo Pase
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredM.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <Award className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">No hay membresías</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Inicia generando una suscripción para un miembro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredM.map((m, idx) => {
              const pst = getProgressState(m.fecha_inicio, m.fecha_vencimiento, m.estado);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: (idx % 12) * 0.05 }}
                  key={m.id_membresia}
                  className="glass-card rounded-[2.5rem] p-6 relative group overflow-hidden neon-hover transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-black text-light-text dark:text-white tracking-tighter">
                        {m.plan_nombre}
                      </h3>
                      <p className="text-sm font-semibold text-gray-400 flex items-center gap-1 mt-1">
                        Socio: {m.socio_nombre}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border font-bold text-[10px] tracking-widest ${pst.text}`}>
                      {pst.msg}
                    </div>
                  </div>

                  <div className="bg-white/30 dark:bg-black/30 p-5 rounded-3xl border border-white/20 dark:border-white/5">
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      <span>Vigencia</span>
                      <span>{pst.days} Días restantes</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                      <div className={`bg-gradient-to-r ${pst.color} h-3 rounded-full shadow-md transition-all duration-1000`} style={{ width: `${pst.p}%` }}></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Inicio</span>
                        <span className="text-sm font-black text-light-text dark:text-white">{m.fecha_inicio}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Vencimiento</span>
                        <span className="text-sm font-black text-light-text dark:text-white">{m.fecha_vencimiento}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button 
                      onClick={() => openModal(m)}
                      className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-2.5 rounded-2xl transition-all border border-white/40 dark:border-white/10 flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Gestionar
                    </button>
                    <button 
                      onClick={() => handleDelete(m)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Exotic Modal Form */}
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
              className="glass-panel w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  {editingId ? 'Editar Membresía' : 'Nueva Membresía'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:rotate-90 transition-transform">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <form id="mem-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                      Socio Afiliado
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <select
                        name="id_socio"
                        required
                        value={formData.id_socio || ''}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium appearance-none"
                      >
                        <option value="">Selecciona un socio...</option>
                        {socios.map(s => (
                          <option key={s.id_socio} value={s.id_socio}>{s.nombre} {s.apellido} ({s.ci})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                        Plan de Gimnasio
                      </label>
                      <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <select
                          name="id_plan"
                          required
                          value={formData.id_plan || ''}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium appearance-none"
                        >
                          <option value="">Selecciona un plan...</option>
                          {planes.map(p => (
                            <option key={p.id_plan} value={p.id_plan}>{p.nombre_plan}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">
                        Estado Inicial
                      </label>
                      <select
                        name="estado"
                        required
                        value={formData.estado || 'activa'}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium appearance-none"
                      >
                        <option value="activa">Activa</option>
                        <option value="pausada">Pausada</option>
                        <option value="vencida">Vencida</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Fecha Inicio
                      </label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        required
                        value={formData.fecha_inicio || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Vencimiento
                      </label>
                      <input
                        type="date"
                        name="fecha_vencimiento"
                        required
                        value={formData.fecha_vencimiento || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-2xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white transition-colors shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="mem-form"
                  className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1"
                >
                  Guardar Pase
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Membresias;
