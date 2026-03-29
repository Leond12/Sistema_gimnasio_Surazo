import React, { useState, useEffect } from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Maquinaria.css';

const Maquinaria = () => {
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/maquinaria_tipos.php?action=read`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTipos(data.data.map(t => ({ value: t.id_tipo, label: t.nombre_tipo })));
        }
      });
  }, []);

  const columns = [
    { key: 'id_maquina', label: 'ID' },
    { key: 'nombre_maquina', label: 'Máquina' },
    { key: 'tipo_nombre', label: 'Tipo' },
    { key: 'fecha_adquisicion', label: 'Adquisición' },
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
        val === 'activa' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
        val === 'inactiva' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}>
        {val}
      </span>
    )},
    { key: 'ultimo_mantenimiento', label: 'Mantenimiento' },
  ];

  const formFields = [
    { name: 'nombre_maquina', label: 'Nombre de Máquina', type: 'text' },
    { name: 'id_tipo', label: 'Tipo de Máquina', type: 'select', options: tipos },
    { name: 'fecha_adquisicion', label: 'Fecha de Adquisición', type: 'date', required: false },
    { name: 'estado', label: 'Estado de Funcionamiento', type: 'select', options: [
      { value: 'activa', label: 'Activa / Operativa' },
      { value: 'inactiva', label: 'Inactiva / Dañada' },
      { value: 'mantenimiento', label: 'En Mantenimiento' }
    ]},
    { name: 'ultimo_mantenimiento', label: 'Último Mantenimiento', type: 'date', required: false },
    { name: 'observaciones', label: 'Observaciones / Detalles', type: 'text', required: false },
  ];

  return (
    <div className="maquinaria-module-container animate-fade-in">
      <GenericCRUD 
        title="Inventario de Maquinarias"
        endpoint="maquinaria"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Maquinaria;
