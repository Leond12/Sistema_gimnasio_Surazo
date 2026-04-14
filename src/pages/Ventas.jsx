import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, X, ShoppingCart, DollarSign, Receipt, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [socios, setSocios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const { user: currentUser } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resVentas, resSocios, resUsr] = await Promise.all([
        fetch(`${apiUrl}/ventas.php?action=read`),
        fetch(`${apiUrl}/socios.php?action=read`),
        fetch(`${apiUrl}/usuarios.php?action=read`)
      ]);
      const dataV = await resVentas.json();
      const dataS = await resSocios.json();
      const dataU = await resUsr.json();
      
      if (dataV.success) setVentas(dataV.data);
      if (dataS.success) setSocios(dataS.data);
      if (dataU.success) setUsuarios(dataU.data);
      
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

  const openModal = (vta = null) => {
    if (vta) {
      setFormData(vta);
      setEditingId(vta.id_venta);
    } else {
      // Por defecto el usuario creador de la venta será la cuenta logueada
      setFormData({ total: 0, id_usuario: currentUser.id });
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
    if (!formData.id_socio || formData.total === '') {
      return showAlert('Selecciona al Socio e ingresa el monto total.', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/ventas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Recibo del cliente actualizado' : 'Venta Registrada', 'success');
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
      showConfirm('¿Salvar estos cambios en el ticket de venta?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (vta) => {
    showConfirm(
      `¿Anular y borrar el ticket de venta por $${vta.total} de ${vta.nombre} permanentemente?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/ventas.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: vta.id_venta })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Ticket P.o.S anulado y retirado.', 'success');
            fetchData();
          } else {
            showAlert('Registros consolidados imposibilitan purga total.', 'error');
          }
        } catch (e) {
          showAlert('Comprobación fallida, verifique su red.', 'error');
        }
      }
    );
  };

  const filterVentas = ventas.filter(v => {
    const term = search.toLowerCase();
    const nf = v.nombre?.toLowerCase() || '';
    const af = v.apellido?.toLowerCase() || '';
    const u  = v.cajero_nombre?.toLowerCase() || '';
    return nf.includes(term) || af.includes(term) || u.includes(term);
  });

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-cyan-500/20 dark:bg-cyan-500/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 dark:bg-green-500/10 rounded-full blur-[60px] translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <ShoppingCart className="w-10 h-10 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-cyan-600 dark:from-white dark:to-cyan-400 tracking-tight">
                Punto de Venta Exclusivo
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Surtidor comercial para clientes del gimnasio.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Rastrear socio o cajero..." 
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 text-white w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-cyan-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <Send className="w-5 h-5" />
              Procesar Compra
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
        </div>
      ) : filterVentas.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <Receipt className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-30" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Facturador Inactivo</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Acerca productos al mostrador para lanzar tu primer ticket de venta.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          <AnimatePresence>
            {filterVentas.map((v, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: (idx % 12) * 0.05, type: 'spring' }}
                key={v.id_venta}
                className="glass-card break-inside-avoid rounded-t-3xl rounded-b-xl p-0 relative group flex flex-col transition-transform hover:-translate-y-1 shadow-lg shadow-cyan-900/5 dark:shadow-none overflow-hidden isolate"
              >
                {/* Upper Receipt Rip graphic */}
                <div className="sticky top-0 h-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-white/50 to-white dark:via-black/50 dark:to-black opacity-40 z-[-1] w-full" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, rgba(255,255,255,0.4) 11px)' }}></div>
                
                <div className="p-6">
                  <div className="flex justify-between w-full items-start mb-6">
                    <div className="px-3 py-1.5 rounded-lg border-2 border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-[10px]">
                      Folio #{v.id_venta.toString().padStart(6, '0')}
                    </div>
                    <span className="text-xs font-semibold text-gray-400">
                      {v.fecha_venta?.split(' ')[0]} {/* Solamente capturamos AAAA-MM-DD visualmente */}
                    </span>
                  </div>

                  <div className="text-center w-full mb-6 relative">
                    <span className="absolute left-1/2 -ml-16 top-1 text-2xl text-cyan-200 dark:text-cyan-900/50 font-sans"><DollarSign className="w-8 h-8"/></span>
                    <h3 className="text-4xl font-black text-light-text dark:text-white tracking-tighter relative z-10">
                      {parseFloat(v.total).toFixed(2)}
                    </h3>
                    <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mt-1">Total Procesado</p>
                  </div>
                  
                  <div className="w-full bg-white/50 dark:bg-black/30 p-4 rounded-xl flex flex-col gap-2 border border-white/40 dark:border-white/5 border-dashed border-t-gray-300 dark:border-t-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Cliente:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{v.nombre || 'Desconocido'} {v.apellido || ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Registró Cajero:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">@{v.cajero_nombre || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-5 w-full flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-2">
                    <button onClick={() => openModal(v)} className="flex-1 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold py-2 rounded-xl transition-all shadow-sm border border-white/40 dark:border-white/10 flex items-center justify-center gap-2 text-sm">
                      Reajustar
                    </button>
                    <button onClick={() => handleDelete(v)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all border border-red-500/20 shadow-sm">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                  <span className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl text-white shadow-lg">
                    <Receipt className="w-6 h-6" />
                  </span>
                  {editingId ? 'Corrección de Ticket' : 'Plataforma de Facturación'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors bg-white/30 dark:bg-white/5 p-2 rounded-full hover:rotate-90 duration-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                <form id="vta-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                        Socio Comprador *
                      </label>
                      <select name="id_socio" required value={formData.id_socio || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white shadow-inner font-medium appearance-none">
                        <option value="">Selección de Cliente...</option>
                        {socios.map(s => (
                          <option key={s.id_socio} value={s.id_socio}>{s.nombre} {s.apellido}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                        Personal Remitente *
                      </label>
                      <select name="id_usuario" required value={formData.id_usuario || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white shadow-inner font-medium appearance-none bg-gray-100/50 dark:bg-gray-800/50">
                        {usuarios.map(u => (
                          <option key={u.id_usuario} value={u.id_usuario}>{u.username}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 ml-1">
                      Monto Bruto Facturado *
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-400 font-bold text-xl">$</span>
                      <input type="number" step="0.01" name="total" required value={formData.total || ''} onChange={handleInputChange} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/30 focus:bg-white dark:focus:bg-black/60 focus:ring-2 focus:ring-cyan-500 outline-none transition-all dark:text-white shadow-inner font-black text-2xl tracking-tighter" placeholder="0.00"/>
                    </div>
                  </div>

                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/30">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white dark:hover:bg-white/20 transition-colors shadow-sm">
                  Descartar
                </button>
                <button type="submit" form="vta-form" className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-1">
                  Imprimir Comprobante
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ventas;
