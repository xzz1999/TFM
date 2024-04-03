import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail, setConversation, getCoversation, botData } from '@/app/lib/actions';
import { BsRobot } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";

export default function ChatBarGemini() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const endOfMessagesRef = useRef(null);
    const searchParams = useSearchParams();
    const [botId, setBotId] = useState('');
    const [user, setUser] = useState('');
    const [email,setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
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

        const initThread = async () => {
            setIsLoading(true);
            setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "bot" }]);
            try {
                const emal = await getEmail(botId, user);
                setEmail(emal);
                const data = {
                    bot: botId,
                    user: emal,
                    Time: null,
                };
                
                const firstTime = await getCoversation(data);
                console.log("firstTime:",firstTime);
                if (firstTime.length == 0) {
                    const botInfo = await botData(botId);
                    const firstConversation = {
                        student: email,
                        bot: botId,
                        Time: new Date(),
                        question: botInfo.role,
                        answer: "Hola, ¿en qué puedo ayudarte?"
                    };
                     await setConversation(firstConversation);
                }
            } catch (e) {
                console.error("Error en inicializar el bot:", e);
            } finally {
                setIsLoading(false);
            }
        };

        initThread();
    }, [botId, user]);

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
            
            const response = await fetch('/api/Gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId,
                    'user': user
                },
                body: JSON.stringify({ question: newMessage })
            });

            const result = await response.json();
            console.log("result:", result);

            if (response.ok) {
                interaccion.answer = result.response;
                setMessages(prevMessages => [...prevMessages, { text: result.response, sender: "bot" }]);            
            } else {
                console.error('Error al añadir el mensaje:', result.error);
            }
            // await setConversation(interaccion);
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setIsProcessing(false);
           
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-animation">
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

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
