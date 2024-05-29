import React from 'react';
import './login.css';
import { addUsers, addThread, getIndex, botData} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import { useSearchParams,useRouter } from 'next/navigation'
//import {useUser} from '@/app/components/chat/chatContext';

export default function Login() {
    const [botId, setBotId] = useState('');
    const [correo, setCorreo] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter()
  
   // const { setUser } = useUser();
    useEffect(() => {
        const Id = searchParams.get('botId')
        setBotId(Id)
    },  []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const correo = e.target.correo.value;
        setCorreo(correo); 
        //setUser(id,correo);
        const usuario = await addUsers(botId, correo);
        if(usuario){
        const hilo = await submitToApi(correo); 
        await addThread (hilo.threadId, botId);
        }
        
        const id = await getIndex(correo,botId);
        
        router.push(`/chats/user?botId=${botId}&user=${id}`);
      
        
       
    };

    const submitToApi = async (correo) => {
        try {
            const response = await fetch('/api/openAI/createThread', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                    
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
