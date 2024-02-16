import React, { useState } from 'react';
import { Button } from '@/app/ui/button';

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
      {/* Botón de enviar utilizando el componente Button */}
      <Button className="mt-1 w-18" onClick={handleSubmit}>Enviar</Button>
    </div>
  );
};

const IA = () => {
  // Estado inicial para bots
  const [bots, setBots] = useState({
    ai: "",
    ai_token: "",
    name: "",
    role: "",
  });

  // Función para actualizar el campo ai del estado bots con el bot seleccionado
  const handleSelectionChange = (selectedOption) => {
    setBots(prevBots => ({
      ...prevBots, // Mantenemos el resto de los campos iguales
      ai: selectedOption.value, // Actualizamos solo el campo ai
    }));
    console.log('bots actualizado:', bots);
  };

  const options = [
    { label: 'CHATGPT-3.5 turbot', value: 'chatgpt-3.5' }, 
    { label: 'CHATGPT-4', value: 'chatgpt-4' }
  ];

  return (
    <div>
      <Dropdown options={options} onSelectionChange={handleSelectionChange} />
    </div>
  );
};
export default IA;
