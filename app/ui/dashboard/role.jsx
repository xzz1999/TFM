import React, { useState } from 'react';
import { Button } from '@/app/ui/button';

function Role() {
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
      alert(`Valor introducido: ${value}`);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        id="inputField"
        style={{
          width: '100%',
          height: '150px',
          resize: 'vertical',
          fontSize: '16px',
          padding: '8px',
          boxSizing: 'border-box',
          borderColor: '#ccc',
          borderRadius: '4px',
          lineHeight: '1.5',
        }}
        placeholder="Escribe aquí las instrucciones del chatbot..."
        value={value}
        onChange={handleChange}
      />

      <Button className="mt-1 w-18" type="submit">
        Enviar
      </Button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}

export default Role;
