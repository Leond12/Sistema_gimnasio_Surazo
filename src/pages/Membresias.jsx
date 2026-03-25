import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Membresias.css';

const Membresias = () => {
  const columns = [
    { key: 'id_membresia', label: 'ID' },
    { key: 'socio_nombre', label: 'Socio' },
    { key: 'plan_nombre', label: 'Plan' },
    { key: 'fecha_inicio', label: 'Inicio' },
    { key: 'fecha_vencimiento', label: 'Vencimiento' },
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        val === 'activa' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        val === 'vencida' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}>
        {val.toUpperCase()}
      </span>
    )}
  ];

  const formFields = [
    { name: 'id_socio', label: 'ID Socio', type: 'number' },
    { name: 'id_plan', label: 'ID Plan', type: 'number' },
    { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
    { name: 'fecha_vencimiento', label: 'Fecha Vencimiento', type: 'date' },
    { name: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'activa', label: 'Activa' },
      { value: 'vencida', label: 'Vencida' },
      { value: 'pausada', label: 'Pausada' }
    ]}
  ];

  return (
    <div className="membresias-module-container">
      <GenericCRUD 
        title="Gestión de Membresías"
        endpoint="membresias"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Membresias;
