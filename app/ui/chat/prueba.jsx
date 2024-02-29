import React, { useState } from 'react';

const CreateChatThread = () => {
  const [threadId, setThreadId] = useState('');
  const [error, setError] = useState('');

  const createThread = async () => {
    try {
      const response = await fetch('/api/createThread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'key': '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'
          // Asegúrate de incluir cualquier otra cabecera requerida por tu API, como la clave de API si es necesario.
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setThreadId(data.threadId);
      setError(''); // Limpiar errores previos si la petición fue exitosa.
    } catch (err) {
      setError(`Failed to create chat thread: ${err.message}`);
      setThreadId(''); // Limpiar el ID del hilo previo si ocurre un error.
    }
  };

  return (
    <div>
      <button onClick={createThread}>Crear Nuevo Hilo de Chat</button>
      {threadId && <p>Hilo creado con éxito. ID: {threadId}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default CreateChatThread;
