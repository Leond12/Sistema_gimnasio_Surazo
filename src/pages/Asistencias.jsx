import React from 'react';
import GenericCRUD from '../components/GenericCRUD';
import './Asistencias.css';

const Asistencias = () => {
  const columns = [
    { key: 'id_asistencia', label: 'ID' },
    { key: 'socio_nombre', label: 'Socio' },
    { key: 'fecha_hora', label: 'Fecha y Hora' },
  ];

  const formFields = [
    { name: 'id_socio', label: 'ID Socio', type: 'number' },
  ];

  return (
    <div className="asistencias-module-container">
      <GenericCRUD 
        title="Control de Asistencias"
        endpoint="asistencias"
        columns={columns}
        formFields={formFields}
      />
    </div>
  );
};

export default Asistencias;
