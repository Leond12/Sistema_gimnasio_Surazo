import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X, Package, AlertTriangle, CheckCircle, PackageOpen, DollarSign, Filter, Boxes } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos'); // 'todos', 'critico', 'disponible'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ stock_actual: 0, stock_minimo: 5, precio_venta: 0 });
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos.php?action=read`);
      const data = await res.json();
      if (data.success) setProductos(data.data);
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

  const openModal = (prod = null) => {
    if (prod) {
      setFormData(prod);
      setEditingId(prod.id_producto);
    } else {
      setFormData({ stock_actual: 0, stock_minimo: 5, precio_venta: 0 });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ stock_actual: 0, stock_minimo: 5, precio_venta: 0 });
    setEditingId(null);
  };

  const confirmSubmit = async () => {
    if (!formData.nombre_producto || formData.precio_venta === '') {
      return showAlert('Complete todos los campos requeridos', 'warning');
    }

    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/productos.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Producto actualizado' : 'Producto registrado', 'success');
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
      showConfirm('¿Salvar cambios en el inventario?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (prod) => {
    showConfirm(
      `¿Retirar "${prod.nombre_producto}" permanentemente?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/productos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: prod.id_producto })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Referencia eliminada.', 'success');
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

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre_producto.toLowerCase().includes(search.toLowerCase());
    const stck = parseInt(p.stock_actual);
    const min = parseInt(p.stock_minimo);
    if (filter === 'critico') return stck <= min && matchesSearch;
    if (filter === 'disponible') return stck > min && matchesSearch;
    return matchesSearch;
  });

  const getStockStatus = (actual, minimo) => {
    if (actual == 0) return { color: 'from-red-500 to-red-700', text: 'AGOTADO', icon: <PackageOpen className="w-6 h-6 text-red-500" /> };
    if (actual <= minimo) return { color: 'from-orange-400 to-orange-600', text: 'STOCK CRÍTICO', icon: <AlertTriangle className="w-6 h-6 text-orange-500" /> };
    return { color: 'from-primary to-primary-dark', text: 'DISPONIBLE', icon: <Boxes className="w-6 h-6 text-primary" /> };
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-0">
      {/* Header Exotic */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/20 blur-3xl -z-10 rounded-full animate-float"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-orange-500/10 blur-2xl -z-10 rounded-full"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/50 dark:bg-black/50 p-4 rounded-2xl shadow-lg border border-white/30 dark:border-white/5 animate-float flex-shrink-0">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-light-text to-primary dark:from-white dark:to-primary-light tracking-tight">
                Almacén Virtual
              </h1>
              <p className="text-light-textMuted dark:text-gray-400 mt-1 font-medium">
                Control de inventario, stock crítico y facturación de productos.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
            <div className="flex bg-white/40 dark:bg-black/20 p-1 rounded-2xl border border-white/40 dark:border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar">
              {['todos', 'disponible', 'critico'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`py-2 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
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
                placeholder="Rastrear mercancía..." 
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
              Nuevo Item
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center">
          <PackageOpen className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6 opacity-40" />
          <h3 className="text-2xl font-bold text-light-text dark:text-dark-text">Inventario Desierto</h3>
          <p className="text-light-textMuted dark:text-gray-400 mt-2 text-lg">Parece que no hay productos que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProductos.map((p, idx) => {
              const st = getStockStatus(parseInt(p.stock_actual), parseInt(p.stock_minimo));
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: (idx % 12) * 0.05 }}
                  key={p.id_producto}
                  className="glass-card rounded-[2.5rem] p-6 relative group overflow-hidden neon-hover transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${st.color}`} />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/50 dark:bg-black/30 rounded-2xl border border-white/30 dark:border-white/5 shadow-sm">
                      {st.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Precio Venta</p>
                      <h3 className="text-3xl font-black text-light-text dark:text-white tracking-tighter flex items-center justify-end">
                        <span className="text-sm text-primary mr-1">$</span>
                        {parseFloat(p.precio_venta).toFixed(2)}
                      </h3>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-light-text dark:text-white truncate mb-4 tracking-tight">
                    {p.nombre_producto}
                  </h3>
                  
                  <div className="bg-white/30 dark:bg-black/20 p-4 rounded-2xl border border-white/20 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Stock Actual</span>
                      <span className={`text-lg font-black ${parseInt(p.stock_actual) <= parseInt(p.stock_minimo) ? 'text-orange-500' : 'text-primary'}`}>
                        {p.stock_actual} <span className="text-[10px] text-gray-400">UND</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${st.color} transition-all duration-700`} style={{ width: `${Math.min((p.stock_actual/20)*100, 100)}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center pt-2 gap-3">
                     <div className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${st.text === 'AGOTADO' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-primary border-primary/20 bg-primary/5'}`}>
                      {st.text}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openModal(p)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(p)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-panel w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[50px] -z-10 rounded-full"></div>
              
              <div className="px-8 py-6 flex justify-between items-center border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/20">
                <h3 className="text-2xl font-black text-light-text dark:text-white flex items-center gap-3">
                    <Boxes className="w-6 h-6 text-primary" />
                  {editingId ? 'Editar Producto' : 'Nuevo Registro'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <form id="prod-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Nombre Comercial</label>
                    <input type="text" name="nombre_producto" required value={formData.nombre_producto || ''} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Precio ($)</label>
                      <input type="number" step="0.01" name="precio_venta" required value={formData.precio_venta} onChange={handleInputChange} className="w-full px-3 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Existencia</label>
                      <input type="number" name="stock_actual" required value={formData.stock_actual} onChange={handleInputChange} className="w-full px-3 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-black" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Stock Mín.</label>
                      <input type="number" name="stock_minimo" required value={formData.stock_minimo} onChange={handleInputChange} className="w-full px-3 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-inner font-black" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1">Descripción Técnica</label>
                    <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} rows="2" className="w-full px-5 py-3.5 rounded-2xl border-none bg-white/60 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 ring-1 ring-black/5 dark:ring-white/10 focus:ring-2 focus:ring-primary backdrop-blur-sm outline-none transition-all dark:text-white shadow-inner font-medium resize-none" />
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/20 dark:border-white/10 flex justify-end gap-3 bg-white/30 dark:bg-black/20">
                <button type="button" onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold bg-white/50 dark:bg-white/10 text-gray-700 dark:text-white hover:bg-white transition-colors">Cancelar</button>
                <button type="submit" form="prod-form" className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1">Guardar Producto</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Productos;
