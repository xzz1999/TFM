import React, { useState } from 'react';

const Dropdown = ({ options }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

  return (
    <div>
      <select
        value={selectedOption}
        onChange={(e) => setSelectedOption(e.target.value)}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// Uso del componente Dropdown en tu aplicación
const IA = () => {
  const options = ['CHATGPT-3.5 turbot', 'CHATGPT-4']; // Opciones del menú desplegable

  return (
    <div>
      <Dropdown options={options} />
    </div>
  );
};
export default IA;
