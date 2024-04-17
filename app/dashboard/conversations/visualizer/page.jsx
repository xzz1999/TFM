
'use client';
import { lusitana,roboto} from '@/app/components/fonts';    
import { useSearchParams } from 'next/navigation';
import { useEffect, useState,useRef } from 'react';
import {getCoversation} from '@/app/lib/actions';
import './Visualizer.css';
import {botData} from '@/app/lib/actions';
import { BsRobot  } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";

const  visualizerPage = () => {

    const searchParams = useSearchParams();
    const [bot, setBot] = useState("");
    const [user, setUser] = useState("");
    const [date, setDate] = useState("");
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef(null);
    const [botName, setBotName] = useState("");
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);   
    useEffect(() => {
        const a = searchParams.get('bot');
        setBot(a);
        const b= searchParams.get('user');
        setUser(b);
        const c = searchParams.get('date');
        setDate(c);
        
    },  []);
    useEffect(() => {
        findBotName();
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
                
                const adaptedMessages = mensajes.map(mensaje => ([
                    {
                        text: mensaje.question, 
                        sender: 'user',
                        student: mensaje.student,
                        date: mensaje.Time 
                    },
                    {
                        text: mensaje.answer, 
                        sender: 'bot',
                        date: mensaje.Time
                    }
                ])).flat();(adaptedMessages);
                setMessages(adaptedMessages);
                const questions = adaptedMessages.filter(msg => msg.sender === 'user').length;
                const answers = adaptedMessages.filter(msg => msg.sender === 'bot').length;
                setTotalQuestions(questions);
                setTotalAnswers(answers);
            }
        } catch (error) {
            console.error('Error al enviar correo a la API:', error);
        }
    };
    const findBotName = async () => {
        try{
            const name = await botData(bot);
            if(name){
            setBotName(name.name);
            }

        }catch(e){
            console.log("Error en busquedad de nombre de bot:",e);
        }
    }


    return (
        <div className="chat-bar">
            <div className="message-stats">
                <p>Total de preguntas realizadas: <span className="stat-value">{totalQuestions}</span></p>
                <p>Total de respuestas recibidas: <span className="stat-value">{totalAnswers}</span></p>
            </div>
            <div className="messages">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender === 'user' ? 'left' : 'right'}`}>
                            <div className="message-header">
                                {message.sender === 'user' ? (
                                    <>
                                        <PiStudent className="icon" />
                                        <p className="sender-info"><strong>{message.student || user}</strong></p>
                                        
                                    </>
                                ) : (
                                    <>
                                        <BsRobot className="icon" />
                                        <p className="sender-info"><strong>{botName}</strong></p>
                                    </>
                                )}
                                <p className="date-info">{new Date(message.date).toLocaleString()}</p>
                            </div>
                            <p>{message.text}</p>
                        </div>
                    ))
                ) : (
                    <div className="no-messages">No hay mensajes para mostrar.</div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};
export default visualizerPage;