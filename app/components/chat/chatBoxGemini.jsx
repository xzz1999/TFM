import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail} from '@/app/lib/actions';
import { BsRobot } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";
import { setConversation } from '@/app/lib/actions';

export default function ChatBarGemini() {
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
    const startChat = async () => {
        try {
            const response = await fetch('/api/Gemini/startChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                },
                body: JSON.stringify({action:'startChat'})
            });
            const data = await response.json();
            if (data) {
                return data.id;
            }
        } catch (error) {
            console.error('Error en empezar el chat:', error);
        }
    };
    const sendMessage = async (id,question) => {
        try {
            const response = await fetch('/api/Gemini/startChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                },
                body: JSON.stringify({id,question,action:'sendMessage'})
            });
            const data = await response.json();
            if (data) {
                return data.response;
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
            const id = await startChat()
            if(id){
                const response  = await sendMessage(id,newMessage);
               
                if(response){
                    interaccion.answer = response;
                    setMessages(prevMessages => [...prevMessages, { text: response, sender: "bot" }]);  

                }
            }
            await setConversation(interaccion);
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
