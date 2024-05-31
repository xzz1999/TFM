import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail} from '@/app/lib/actions';
import { BsRobot } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";
import { setConversation, isRestricted, botData } from '@/app/lib/actions';

export default function ChatBarLlama() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const endOfMessagesRef = useRef(null);
    const searchParams = useSearchParams();
    const [botId, setBotId] = useState('');
    const [user, setUser] = useState('');
    const [email,setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const botIdValue = searchParams.get('botId') || "";
        const userValue = searchParams.get('user') || "";
        if (!botIdValue || !userValue) {
            console.error("Bot ID o user no encontrado.");
            
            return;
        }
        setBotId(botIdValue);
        setUser(userValue);
    }, [searchParams]);

    useEffect(() => {
        if(!botId || !user) return;
        setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "bot" }]);
        const initThread = async () => {
            try {
                const correo = await getEmail(botId,user);
                setEmail(correo);
            } catch (error) {
                console.error("Error en encontrar email:", error);
            }
        };

        initThread();
    }, [botId, user]);

    const sendMessage = async (id,question) => {
    
        try {
            const data = {
                modelId:id,
                message:question
    
            }
            const response = await fetch('/api/llama/sendMessage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
     
            if (result.data) {
                const res = {
                    data: result.data,
                    time:result.time
                }
                return res
            }
        } catch (error) {
            console.error('Error en empezar el chat:', error);
        }
    };
    const validate = async (mensaje,topics, invalidTopics) => {
        try {
            const dataToSend = {
                message : mensaje,
                topics: topics,
                invalidTopics: invalidTopics
            }
            const response = await fetch('/api/Guardrail/sendMensaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            if (data) {
                if(data.status === "sucess"){
                    return true
                }else{
                    return false
                }
                
            }
        } catch (error) {
            console.error('Error en empezar el chat:', error);
        }
    };


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setIsProcessing(true);
        setMessages(prevMessages => [...prevMessages, { text: newMessage, sender: "user" }]);
        setNewMessage('');
        try {
            const interaccion = {
                bot: botId,
                Time: new Date(),
                student: email,
                question: newMessage
            };
            
            const response  = await sendMessage(botId,newMessage);
            const restricted = await isRestricted(botId)
                if(response){
                    if(restricted){
                        const bot = await botData(botId);
                        const valido = await validate(response.data, bot.validTopics, bot.invalidTopics)
                        if(valido){
                            interaccion.answer = response.data;
                            interaccion.responseTime = response.time
                            setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]); 
                            await setConversation(interaccion);
                        }else{
                            interaccion.answer = "lo siento, no puedo responderte acerca de este tema";
                            interaccion.responseTime = response.time;
                            setMessages(prevMessages => [...prevMessages, { text: "lo siento, no puedo responderte acerca de esta temas", sender: "bot" }]);  
                            await setConversation(interaccion);
                        }
                    }else{
                        interaccion.answer = response.data;
                        interaccion.responseTime = response.time
                        setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]); 
                        await setConversation(interaccion);

                    }
                }
                            
                             

           

        } catch (error) {   
            console.error('Error en la solicitud:', error);
        } finally {
            setIsProcessing(false);
           
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-bar">
            <div className="messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender === 'bot' ? 'left' : 'right'}`}>
                        {message.sender === 'bot' ? (
                            <>
                                <BsRobot className="chatbot-icon" />
                                <p>{message.text}</p>
                            </>
                        ) : (
                            <>
                                <PiStudent className="user-icon" />
                                <p>{message.text}</p>
                            </>
                        )}
                    </div>
                ))}
                {isProcessing && (
                    <div className="message left">
                        <BsRobot className="chatbot-icon" />
                        <div className="dot-animation">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={isProcessing}
                />
                <button type="submit" disabled={!newMessage.trim() || isProcessing}>Enviar</button>
            </form>
        </div>
    );
}
