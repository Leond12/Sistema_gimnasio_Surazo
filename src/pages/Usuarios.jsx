import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Usuarios.css';

const Usuarios = () => {
  const columns = [
    { key: 'id_usuario', label: 'ID' },
    { key: 'username', label: 'Usuario' },
    { key: 'roles_nombre', label: 'Rol' },
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        parseInt(val) === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {parseInt(val) === 1 ? 'ACTIVO' : 'INACTIVO'}
      </span>
    )}
  ];

  const formFields = [
    { name: 'username', label: 'Nombre de Usuario', type: 'text' },
    { name: 'password', label: 'Contraseña (Deje en blanco para no cambiar)', type: 'password', required: false },
    { name: 'id_rol', label: 'Rol ID', type: 'number' },
    { name: 'estado', label: 'Estado (1=Activo, 0=Inactivo)', type: 'number', options: [
      { value: 1, label: 'Activo' },
      { value: 0, label: 'Inactivo' }
    ]}
  ];

  return (
    <div className="usuarios-module-container">
      <GenericCRUD 
        title="Gestión de Usuarios del Sistema"
        endpoint="usuarios"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Usuarios;
