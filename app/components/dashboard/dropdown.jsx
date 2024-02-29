import React, { useState } from 'react';
import { Button } from '@/app/components/button'; // Asegúrate de que la ruta de importación sea correcta

const Dropdown = ({ options, onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  // Manejador para el evento de clic en el botón de enviar
  const handleSubmit = () => {
    // Llamada a la función pasada como prop para actualizar el estado en el componente padre
    onSelectionChange(selectedOption);
  };

  return (
    <div>
      <select
        value={selectedOption.value}
        onChange={(e) => {
          const option = options.find(option => option.value === e.target.value);
          setSelectedOption(option);
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
   
      <Button className="mt-1 w-18" onClick={handleSubmit}>Enviar</Button>
    </div>
  );
};

export default Dropdown;
