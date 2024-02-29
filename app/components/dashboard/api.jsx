import React from 'react';
import Dropdown from './dropdown'; // Asegúrate de que la ruta de importación sea correcta

const IA = ({ onOptionSelected }) => {
  const options = [
    { label: 'CHATGPT-3.5 turbot', value: 'gpt-3.5-turbo' },
    { label: 'CHATGPT-4', value: 'gpt-4-1106-preview' }
  ];

  return (
    <div>
      <Dropdown options={options} onSelectionChange={onOptionSelected} />
    </div>
  );
};

export default IA;
