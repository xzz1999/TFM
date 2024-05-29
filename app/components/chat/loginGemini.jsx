import React from 'react';
import './login.css';
import { addUsers, addThread, getIndex, botData} from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import { useSearchParams,useRouter } from 'next/navigation'
//import {useUser} from '@/app/components/chat/chatContext';

export default function LoginGemini() {
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
        
        const id = await getIndex(correo,botId);
        
        router.push(`/chats/user?botId=${botId}&user=${id}`);
      
        
       
    };

 

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <label htmlFor="correo" className="form-label">Introduce tu Correo electrónicos:</label>
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
