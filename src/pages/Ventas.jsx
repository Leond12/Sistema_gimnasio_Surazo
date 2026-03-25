import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Ventas.css';

const Ventas = () => {
  const columns = [
    { key: 'id_venta', label: 'ID' },
    { key: 'socio_nombre', label: 'Socio' },
    { key: 'cajero_nombre', label: 'Cajero' },
    { key: 'total', label: 'Total', render: (val) => <span className="font-bold text-primary">${parseFloat(val).toFixed(2)}</span> },
    { key: 'fecha_venta', label: 'Fecha' },
  ];

  // Las ventas reales en un ERP requieren un componente maestro-detalle, pero usaremos el CRUD base para el registro inicial
  const formFields = [
    { name: 'id_socio', label: 'ID Socio', type: 'number', required: false },
    { name: 'id_usuario', label: 'ID Usuario (Cajero)', type: 'number' },
    { name: 'total', label: 'Total Venta', type: 'number' },
  ];

  return (
    <div className="ventas-module-container">
      <GenericCRUD 
        title="Registro de Ventas"
        endpoint="ventas"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Ventas;
