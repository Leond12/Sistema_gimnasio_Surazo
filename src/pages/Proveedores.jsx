import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Building2, UserCircle, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
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
      const res = await fetch(`${apiUrl}/proveedores.php?action=read`);
      const data = await res.json();
      if (data.success) {
        setProveedores(data.data);
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

  const openModal = (prov = null) => {
    if (prov) {
      setFormData(prov);
      setEditingId(prov.id_proveedor);
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
    if (!formData.nombre_empresa) {
      return showAlert('El nombre de la empresa es obligatorio', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/proveedores.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Proveedor actualizado' : 'Proveedor registrado', 'success');
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
      showConfirm('¿Actualizar los datos de este proveedor?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (prov) => {
    showConfirm(
      `¿Eliminar al proveedor "${prov.nombre_empresa}"?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/proveedores.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: prov.id_proveedor })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Proveedor eliminado.', 'success');
            fetchData();
          } else {
            showAlert('No se puede eliminar: tiene compras asociadas.', 'error');
          }
        } catch (e) {
          showAlert('Error de conexión', 'error');
        }
      }
    );
  };

  const filteredP = proveedores.filter(p => {
    const term = search.toLowerCase();
    return p.nombre_empresa.toLowerCase().includes(term) || 
           (p.contacto_nombre && p.contacto_nombre.toLowerCase().includes(term));
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Exotic */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Building2 className="w-10 h-10 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-cyan-700 dark:from-white dark:to-cyan-400 tracking-tight">
                Alianzas Estratégicas
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Gestión centralizada de proveedores y contactos corporativos.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar socio comercial..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Nuevo Aliado
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
        </div>
      ) : filteredP.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <Briefcase className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Sin Proveedores</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Inicia registrando a tus socios comerciales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredP.map((p, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.05 }}
                key={p.id_proveedor}
                className="glass-card rounded-3xl p-6 relative group border-l-4 border-l-cyan-500 flex flex-col transition-all hover:-translate-y-2 hover:shadow-cyan-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Building2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-cyan-500 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-light-text dark:text-white truncate mb-1">
                  {p.nombre_empresa}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 font-bold mb-4">
                  <UserCircle className="w-4 h-4" />
                  {p.contacto_nombre || 'Sin contacto directo'}
                </div>

                <div className="mt-auto space-y-3 pt-4 border-t border-white/40 dark:border-white/5">
                  <div className="flex items-center gap-3 text-xs text-light-textMuted dark:text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="font-medium">{p.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-light-textMuted dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="font-medium truncate">{p.email || 'Sin correo'}</span>
                  </div>
                  {p.direccion && (
                    <div className="flex items-center gap-3 text-xs text-light-textMuted dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="font-medium truncate">{p.direccion}</span>
                    </div>
                  )}
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-cyan-500" />
                  {editingId ? 'Editar Proveedor' : 'Nuevo Socio Comercial'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <form id="prov-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Nombre de la Empresa</label>
                    <input
                      type="text"
                      name="nombre_empresa"
                      required
                      value={formData.nombre_empresa || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Contacto Directo</label>
                      <input
                        type="text"
                        name="contacto_nombre"
                        value={formData.contacto_nombre || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Email Corporativo</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Dirección Física</label>
                    <textarea
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-6 py-3 rounded-2xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="prov-form"
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 text-white shadow-xl shadow-cyan-500/30 transition-all transform hover:-translate-y-1"
                >
                  Guardar Aliado
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Proveedores;
