import React from 'react';
import './login.css';
import { addUsers, addThread, getHilo} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [id, setId] = useState('');
    const [correo, setCorreo] = useState('');
    const router = new useRouter;
    useEffect(() => {
        const botId = localStorage.getItem('selectedBotId');
        if (botId) {
            setId(botId);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const correo = e.target.correo.value;
        setCorreo(correo); // Guardar el correo en el estado, si aún necesitas hacerlo
        console.log("creando thread");
        const usuario = await addUsers(id, correo);
        console.log("usuario:", usuario);
        if(usuario){
        const hilo = await submitToApi(correo); // Enviar el correo a la 
        console.log("hilo:",hilo.threadId);
        await addThread (hilo.threadId, id);
        }
        console.log("enviando primer mensaje");
        const conv = await getHilo(id,correo);
        console.log("conv:",conv);
        const mensaje= {
            threadId: conv,
            input: "hola"

        }
        await submitMessage(mensaje)
        const name = correo.split("@")[0];
        router.push(`/chats/${id}/${name}`);
        
       
    };

    const submitToApi = async (correo) => {
        try {
            const response = await fetch('/api/createThread', { // Sustituye '/api/ruta-de-tu-api' con tu endpoint real
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': id
                    // Incluye aquí otros headers necesarios, como tokens de autenticación
                },
                body: JSON.stringify({ correo }) // Asegúrate de que el cuerpo coincide con lo que tu API espera
            });

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.statusText}`);
            }

            const data = await response.json(); // Suponiendo que tu API responda con JSON
            return data;
        } catch (error) {
            console.error('Error al enviar correo a la API:', error);
        }
    };


const submitMessage = async (mensaje)=>{

 
  try {
    // Realiza la solicitud al API
    const response = await fetch('/api/addMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'id': id
      },
      body: JSON.stringify(mensaje),
    });

    // Espera la respuesta del API
    const result = await response.json();

    // Manejo de la respuesta
    if (response.ok) {
      console.log('Mensaje añadido exitosamente:', result);
    } else {
      console.error('Error al añadir el mensaje:', result.error);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
}

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="correo" className="form-label">Introduce tu Correo electrónico:</label>
                <input
                    id="correo"
                    name="correo"
                    type="email"
                    required
                    className="form-input"
                />
                <button type="submit" className="submit-button">Enviar</button>
            </form>
        </div>
    );
}
