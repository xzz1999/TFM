import React from 'react';

const Dropdown = ({ options, onSelectionChange }) => {
 
  const handleChange = (event) => {
    
    const selectedOption = options.find(option => option.value === event.target.value);
    
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedOption);
    } else {
      console.warn('onSelectionChange no es una función');
    }
  };

  return (
    <select onChange={handleChange}>
      
      <option value=""></option>
      
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
