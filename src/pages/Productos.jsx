import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Productos.css';

const Productos = () => {
  const columns = [
    { key: 'id_producto', label: 'ID' },
    { key: 'nombre_producto', label: 'Producto' },
    { key: 'precio_venta', label: 'Precio', render: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'stock_actual', label: 'Stock Actual' },
    { key: 'stock_minimo', label: 'Stock Mínimo' },
  ];

  const formFields = [
    { name: 'nombre_producto', label: 'Nombre del Producto', type: 'text' },
    { name: 'descripcion', label: 'Descripción', type: 'text', required: false },
    { name: 'precio_venta', label: 'Precio de Venta', type: 'number' },
    { name: 'stock_actual', label: 'Stock Actual', type: 'number' },
    { name: 'stock_minimo', label: 'Stock Mínimo', type: 'number' },
  ];

  return (
    <div className="productos-module-container">
      <GenericCRUD 
        title="Inventario de Productos"
        endpoint="productos"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Productos;
