import React, { useState } from 'react';
import { Button } from '@/app/components/button'; // Asegúrate de que la ruta de importación sea correcta

function Name({ onNameSubmit }) { // Agrega onNameSubmit como prop
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
      onNameSubmit(value); // Llama a la función de callback con el valor del nombre
      setValue(''); // Opcional: limpiar el campo después de enviar
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