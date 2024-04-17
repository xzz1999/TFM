import React, { useState } from 'react';
import { Button } from '@/app/components/button'; 

const Dropdown = ({ options, onSelectionChange }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);

 
  const handleSubmit = () => {
    
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
