'use client';
import { lusitana,roboto} from '@/app/components/fonts';    
import { useSearchParams } from 'next/navigation';
import { useEffect, useState,useRef } from 'react';
import {getCoversation} from '@/app/lib/actions';
import { BsRobot } from 'react-icons/bs'; 
import { PiStudent } from 'react-icons/pi';
import  './Visualizer.css';
const  visualizerPage = () => {

    const searchParams = useSearchParams();
    const [bot, setBot] = useState("");
    const [user, setUser] = useState("");
    const [date, setDate] = useState("");
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef(null);
    useEffect(() => {
        const a = searchParams.get('bot');
        setBot(a);
        const b= searchParams.get('user');
        setUser(b);
        const c = searchParams.get('date');
        setDate(c);
        
    },  []);
    useEffect(() => {
        findConversation();
      }, [bot, user, date]);

    const findConversation = async () => {
        const data = {
            bot:bot,
            user: user,
            Time: date
        }
        try {
            const mensajes = await getCoversation(data);
            if(mensajes){
                
                const adaptedMessages = mensajes.map(mensaje => ({
                    text: mensaje.question, 
                    sender: 'user' 
                })).concat(mensajes.map(mensaje => ({
                    text: mensaje.answer, 
                    sender: 'bot'
                })));
                setMessages(adaptedMessages);
            }

            
        } catch (error) {
            console.error('Error al enviar correo a la API:', error);
        }
    };

    return (
        <div className="chat-bar">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender === 'user' ? 'left' : 'right'}`}>
                        {message.sender === 'user' ? (
                            <>
                                {/* Reemplaza PiStudent por el ícono correcto de usuario */}
                                <PiStudent className="user-icon" />
                                <p>{message.text}</p>
                            </>
                        ) : (
                            <>
                                <BsRobot className="chatbot-icon" />
                                <p>{message.text}</p>
                            </>
                        )}
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};

export default visualizerPage;