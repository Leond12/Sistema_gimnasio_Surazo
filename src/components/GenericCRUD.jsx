import React, { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenericCRUD = ({ title, endpoint, columns, formFields, cssModule }) => {
  const [data, setData] = useState([]);
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
      const res = await fetch(`${apiUrl}/${endpoint}.php?action=read`);
      const result = await res.json();
      if (result.success) setData(result.data);
      else showAlert(result.error || 'Error al cargar datos', 'error');
    } catch (e) {
      showAlert('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const action = editingId ? 'update' : 'create';
      const payload = { action, ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch(`${apiUrl}/${endpoint}.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showAlert(editingId ? 'Actualizado correctamente' : 'Creado correctamente', 'success');
        closeModal();
        fetchData();
      } else {
        showAlert(result.error || 'Error en la operación', 'error');
      }
    } catch (e) {
      showAlert('Error de conexión', 'error');
    }
  };

  const handleDelete = (id) => {
    showConfirm('¿Estás seguro de que deseas eliminar este registro?', async () => {
      try {
        const res = await fetch(`${apiUrl}/${endpoint}.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        });
        const result = await res.json();
        if (result.success) {
          showAlert('Eliminado correctamente', 'success');
          fetchData();
        } else {
          showAlert(result.error || 'Error al eliminar', 'error');
        }
      } catch (e) {
        showAlert('Error de conexión', 'error');
      }
    });
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className={`space-y-6 ${cssModule?.container || ''}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">{title}</h1>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium shadow-soft transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center text-primary">
            <div className="animate-spin inline-block w-10 h-10 border-[4px] border-current border-t-transparent text-primary rounded-full" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center text-light-textMuted dark:text-dark-textMuted bg-light-surface dark:bg-dark-surface rounded-xl shadow-soft border border-light-border dark:border-dark-border">
            No hay registros encontrados.
          </div>
        ) : (
          filteredData.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={item.id || idx}
              className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-soft border border-light-border dark:border-dark-border overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 flex flex-col relative group"
            >
              {/* Header / Top Decor */}
              <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-dark"></div>
              
              <div className="p-5 flex flex-col h-full">
                {/* ID and Primary Value */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 max-w-[70%]">
                    <span className="bg-primary/10 text-primary dark:bg-primary/20 font-bold px-2 py-1 rounded-lg text-xs shrink-0 shadow-sm border border-primary/20">
                      #{item[columns[0].key]}
                    </span>
                    {columns.length > 1 && (
                      <h3 className="font-bold text-[1.05rem] text-light-text dark:text-dark-text truncate">
                        {columns[1].render ? columns[1].render(item[columns[1].key], item) : item[columns[1].key]}
                      </h3>
                    )}
                  </div>
                  
                  {/* Actions (Floating on hover/visible) */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openModal(item)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id || item[columns[0].key])} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rest of the data points */}
                <div className="flex-1 flex flex-col gap-2.5">
                  {columns.slice(2).map((col, cidx) => (
                    <div key={cidx} className="flex justify-between items-center text-sm border-b border-light-border/50 dark:border-dark-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-light-textMuted dark:text-dark-textMuted font-medium pr-2 max-w-[45%] truncate">{col.label}</span>
                      <span className="text-light-text dark:text-dark-text font-semibold text-right flex-1 truncate">
                        {col.render ? col.render(item[col.key], item) : (item[col.key] || <span className="text-gray-300 dark:text-gray-600">-</span>)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-bg/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-light-surface dark:bg-dark-surface w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-light-border dark:border-dark-border flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-gray-800/30">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
                  {editingId ? `Editar ${title}` : `Nuevo ${title}`}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="crud-form" onSubmit={handleSubmit} className="space-y-4">
                  {formFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          required={field.required !== false}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(e, field.name)}
                          className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        >
                          <option value="">Seleccione...</option>
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type || 'text'}
                          required={field.required !== false}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(e, field.name)}
                          className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </form>
              </div>

              <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg font-medium text-light-textMuted dark:text-dark-textMuted hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="crud-form"
                  className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark shadow-soft transition-colors"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenericCRUD;
