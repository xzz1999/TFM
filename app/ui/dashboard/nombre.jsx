import React, { useState } from 'react';
import {Button} from '@/app/ui/button';
function Name() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(''); // Estado para almacenar el mensaje de error

  const handleChange = (event) => {
    setValue(event.target.value);
    if (error) setError(''); // Limpiar el error cuando el usuario comienza a escribir
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) {
      // Establecer un mensaje de error si el valor es vacío o solo espacios en blanco
      setError('Por favor, introduce un valor antes de enviar.');
    } else {
      // Aquí puedes manejar el valor introducido, como enviarlo a un servidor
      alert(`Valor introducido: ${value}`);
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
      <Button className="mt-1 w-18" type='submit'>
      Enviar  
    </Button>
      {error && <div style={{color: 'red'}}>{error}</div>} {/* Mostrar el mensaje de error si existe */}
      
    </form>
  );
}

export default Name;
