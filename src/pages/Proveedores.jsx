import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Proveedores.css'; // Asegura su existencia aunque esté vacío

const Proveedores = () => {
  const columns = [
    { key: 'id_proveedor', label: 'ID' },
    { key: 'nombre_empresa', label: 'Empresa' },
    { key: 'contacto_nombre', label: 'Contacto' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Correo' },
  ];

  const formFields = [
    { name: 'nombre_empresa', label: 'Nombre de la Empresa', type: 'text' },
    { name: 'contacto_nombre', label: 'Nombre del Contacto', type: 'text', required: false },
    { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
    { name: 'email', label: 'Correo Electrónico', type: 'email', required: false },
    { name: 'direccion', label: 'Dirección Física', type: 'text', required: false },
  ];

  return (
    <div className="proveedores-module-container animate-fade-in">
      <GenericCRUD 
        title="Gestión de Proveedores"
        endpoint="proveedores"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Proveedores;
