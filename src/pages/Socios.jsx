import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Socios.css'; // Módulo CSS separado como solicitado

const Socios = () => {
  const columns = [
    { key: 'id_socio', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'ci', label: 'CI' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'fecha_registro', label: 'Registro' },
  ];

  const formFields = [
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'apellido', label: 'Apellido', type: 'text' },
    { name: 'ci', label: 'CI (Cédula de Identidad)', type: 'text' },
    { name: 'email', label: 'Correo Electrónico', type: 'email', required: false },
    { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
  ];

  return (
    <div className="socios-module-container">
      <GenericCRUD 
        title="Gestión de Socios"
        endpoint="socios"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Socios;
