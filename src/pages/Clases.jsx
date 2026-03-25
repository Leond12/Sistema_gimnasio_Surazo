import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Clases.css';

const Clases = () => {
  const columns = [
    { key: 'id_clase', label: 'ID' },
    { key: 'nombre_clase', label: 'Clase' },
    { key: 'instructor_nombre', label: 'Instructor' },
    { key: 'cupo_maximo', label: 'Cupo Máximo' },
    { key: 'horario_inicio', label: 'Horario' },
  ];

  const formFields = [
    { name: 'nombre_clase', label: 'Nombre de la Clase', type: 'text' },
    { name: 'id_instructor', label: 'ID Instructor (Usuario)', type: 'number' },
    { name: 'cupo_maximo', label: 'Cupo Máximo', type: 'number' },
    { name: 'horario_inicio', label: 'Horario de Inicio', type: 'datetime-local' },
  ];

  return (
    <div className="clases-module-container">
      <GenericCRUD 
        title="Gestión de Clases"
        endpoint="clases"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Clases;
