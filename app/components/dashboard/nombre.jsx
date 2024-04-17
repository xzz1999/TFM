import React, { useState } from 'react';
import { Button } from '@/app/components/button'; 

function Name({ onNameSubmit }) { 
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setValue(event.target.value);
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) {
      setError('Por favor, introduce un valor antes de enviar.');
    } else {
      onNameSubmit(value); 
      setValue(''); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        id="inputField"
        value={value}
        onChange={handleChange}
      />
      <Button className="mt-1 w-18" type="submit">Enviar</Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

export default Name;
