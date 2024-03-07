import React from 'react';
import './login.css';
import { addUsers, addThread, getHilo} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
//import {useUser} from '@/app/components/chat/chatContext';

export default function Login() {
    const [id, setId] = useState('');
    const [correo, setCorreo] = useState('');
    const router = new useRouter;
   // const { setUser } = useUser();
    useEffect(() => {
        const botId = localStorage.getItem('selectedBotId');
        if (botId) {
            setId(botId);
       
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const correo = e.target.correo.value;
        setCorreo(correo); 
        //setUser(id,correo);
        const usuario = await addUsers(id, correo);
        console.log("usuario:", usuario);
        if(usuario){
        const hilo = await submitToApi(correo); 
        console.log("hilo:",hilo.threadId);
        await addThread (hilo.threadId, id);
        }
        console.log("enviando primer mensaje");
        const conv = await getHilo(id,correo);
    
        const mensaje= {
            threadId: conv,
            input: "hola"

        }
        await submitMessage(mensaje)
        const conversation = await runAssistant(id,conv);   
        
        const name = correo.split("@")[0];
        router.push(`/chats/${id}/${name}`);
      
        
       
    };

    const submitToApi = async (correo) => {
        try {
            const response = await fetch('/api/openAI/createThread', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': id
                    
                },
                body: JSON.stringify({ correo }) 
            });

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.statusText}`);
            }

            const data = await response.json(); 
            return data;
        } catch (error) {
            console.error('Error al enviar correo a la API:', error);
        }
    };


const submitMessage = async (mensaje)=>{

  try {
  
    const response = await fetch('/api/openAI/addMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'id': id
      },
      body: JSON.stringify(mensaje),
    });


    const result = await response.json();

  
    if (response.ok) {
      console.log('Mensaje añadido exitosamente:', result);
    } else {
      console.error('Error al añadir el mensaje:', result.error);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
}
const  runAssistant = async (assistantId, threadId) =>{
    try {
      
      const requestBody = {
        assistantId: assistantId,
        threadId: threadId,
      };
  
     
      const response = await fetch('/api/openAI/runAssistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'id': id
        },
        body: JSON.stringify(requestBody),
      });
  
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      
      const data = await response.json();
      console.log('Run ID:', data.runId);
  
      
  
    } catch (error) {
      console.error('error en ejecutar el asistente:', error.message);
    
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
