
'use client';
import { lusitana,roboto} from '@/app/components/fonts';    
import { useSearchParams } from 'next/navigation';
import { useEffect, useState,useRef } from 'react';
import {getCoversation} from '@/app/lib/actions';
import './visualizer.css';
import {botData} from '@/app/lib/actions';
import { BsRobot  } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";
import { Suspense } from 'react';
import { Button } from '@/app/components/button';


const VisualizerComponent = () => {

    const searchParams = useSearchParams();
    const [bot, setBot] = useState("");
    const [user, setUser] = useState("");
    const [date, setDate] = useState("");
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef(null);
    const [botName, setBotName] = useState("");
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);   
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [averageResponseTime, setAverageResponseTime] = useState(0);
    const [interactedStudents, setInteractedStudents] = useState(new Set());
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
                        date: mensaje.Time,
                    },
                    {
                        text: mensaje.answer, 
                        sender: 'bot',
                        date: mensaje.Time,
                        responseTime: mensaje.responseTime
                    }
                ])).flat();(adaptedMessages);
                setMessages(adaptedMessages);
                const questions = adaptedMessages.filter(msg => msg.sender === 'user').length;
                const answers = adaptedMessages.filter(msg => msg.sender === 'bot').length;
                setTotalQuestions(questions);
                setTotalAnswers(answers);
                const responseTimes = adaptedMessages.filter(msg => msg.sender === 'bot').map(msg => msg.responseTime);
                const totalResponseTime = responseTimes.reduce((acc, curr) => acc + curr, 0);
                setTotalResponseTime(totalResponseTime);
                const averageResponseTime = totalResponseTime / responseTimes.length;
                setAverageResponseTime(averageResponseTime);
                const students = new Set(adaptedMessages.map(msg => msg.student));
                setInteractedStudents(students);    
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
    const handleSummaryButtonClick = () => {

        console.log('Botón Resumen clickeado');
    }


    return (
        <div className="chat-bar">
            <div className="message-stats">
                <p>Total de preguntas realizadas: <span className="stat-value">{totalQuestions}</span></p>
                <p>Total de respuestas recibidas: <span className="stat-value">{totalAnswers}</span></p>
                <p>Tiempo medio de respuesta: <span className="stat-value">{(averageResponseTime / 1000).toFixed(2)} s</span></p>
                <p>Número de alumnos interactuados: <span className="stat-value">{interactedStudents.size - 1}</span></p>
                <Button onClick={handleSummaryButtonClick}style={{ marginLeft: '100px', background:"green", color:"black" }}>Resumen</Button>
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

const visualizerPage = () => {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <VisualizerComponent/>
      </Suspense>
    );
  };
  
export default visualizerPage;