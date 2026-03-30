import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, X, Package, AlertTriangle, CheckCircle, PackageOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos'); // 'todos', 'critico', 'disponible'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ stock_actual: 0, stock_minimo: 5, precio_venta: 0 });
  const [editingId, setEditingId] = useState(null);

  const { showAlert, showConfirm } = useAlert();
  const { user: currentUser } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/productos.php?action=read`);
      const data = await res.json();
      
      if (data.success) {
        setProductos(data.data);
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
        showAlert(editingId ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente', 'success');
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
      showConfirm('¿Estás seguro de actualizar este producto en el inventario?', () => confirmSubmit());
    } else {
      confirmSubmit();
    }
  };

  const handleDelete = (prod) => {
    showConfirm(
      `¿Eliminar permanentemente el producto "${prod.nombre_producto}" del inventario?`, 
      async () => {
        try {
          const res = await fetch(`${apiUrl}/productos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: prod.id_producto })
          });
          const result = await res.json();
          if (result.success) {
            showAlert('Producto eliminado correctamente.', 'success');
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

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre_producto.toLowerCase().includes(search.toLowerCase());
    
    // Convert to numbers for safe comparison
    const stck = parseInt(p.stock_actual);
    const min = parseInt(p.stock_minimo);

    if (filter === 'critico') return stck <= min && matchesSearch;
    if (filter === 'disponible') return stck > min && matchesSearch;
    return matchesSearch;
  });

  const getStockStatus = (actual, minimo) => {
    if (actual == 0) return { color: 'red', text: 'AGOTADO', icon: <PackageOpen className="w-5 h-5 text-red-500" /> };
    if (actual <= minimo) return { color: 'yellow', text: 'STOCK CRÍTICO', icon: <AlertTriangle className="w-5 h-5 text-yellow-500" /> };
    return { color: 'green', text: 'DISPONIBLE', icon: <CheckCircle className="w-5 h-5 text-primary" /> };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Inventario de Productos
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-1 ml-11">
            Gestión dinámica de mercancía, precios y niveles de stock.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-4 items-center">
          <div className="bg-light-surface dark:bg-dark-surface p-1 rounded-xl flex shadow-sm border border-light-border dark:border-dark-border w-full sm:w-auto">
            {['todos', 'disponible', 'critico'].map(f => (
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
              placeholder="Buscar producto..." 
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
            Nuevo Producto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : filteredProductos.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-12 text-center border border-light-border dark:border-dark-border shadow-soft">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-light-text dark:text-dark-text">El inventario está vacío</h3>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-2">Prueba cambiando los filtros o registrando mercancía.</p>
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
                  transition={{ duration: 0.2, delay: (idx % 10) * 0.05 }}
                  key={p.id_producto}
                  className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-soft border border-light-border dark:border-dark-border relative group overflow-hidden flex flex-col"
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${st.color === 'red' ? 'bg-red-500' : st.color === 'yellow' ? 'bg-yellow-500' : 'bg-primary'}`} />
                  
                  <div className="flex justify-between items-start mb-3 mt-1">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${st.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : st.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-primary/10 dark:bg-primary/20'}`}>
                      {st.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-light-text dark:text-dark-text">${parseFloat(p.precio_venta).toFixed(2)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text truncate">
                    {p.nombre_producto}
                  </h3>
                  
                  <div className="flex gap-2 mt-3 text-sm">
                    <span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Stock:</span>
                    <span className={`font-bold ${st.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-light-text dark:text-dark-text'}`}>{p.stock_actual} und(s)</span>
                  </div>

                  <div className="mt-auto pt-4 flex justify-between items-center w-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${st.color === 'red' ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/40' : st.color === 'yellow' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/40' : 'text-primary bg-primary/10 dark:text-primary-light dark:bg-primary/20'}`}>
                      {st.text}
                    </div>
                    <div className="flex gap-1 border-t-0">
                      <button 
                        onClick={() => openModal(p)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Modificar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Eliminar"
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
      )}

      {/* Modal CRUD */}
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
                  <Package className="w-6 h-6 text-primary" />
                  {editingId ? 'Editar Producto' : 'Registrar Producto'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white dark:hover:bg-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <form id="prod-form" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      name="nombre_producto"
                      required
                      value={formData.nombre_producto || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion || ''}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5">
                        Precio Unit.
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="precio_venta"
                          required
                          value={formData.precio_venta}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5 line-clamp-1">
                        Stock Disp.
                      </label>
                      <input
                        type="number"
                        name="stock_actual"
                        required
                        value={formData.stock_actual}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-1.5 line-clamp-1">
                        Tolerancia Mín.
                      </label>
                      <input
                        type="number"
                        name="stock_minimo"
                        required
                        value={formData.stock_minimo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white shadow-sm"
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
                  form="prod-form"
                  className="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                  {editingId ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'Guardar Cambios' : 'Añadir Producto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Productos;
