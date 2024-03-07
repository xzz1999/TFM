import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useRouter } from 'next/navigation';
//import { useUser } from '@/app/components/chat/chatContext';


export default function ChatBar() {
    const router = useRouter();
    const [messages, setMessages] = useState([]); // Almacena los mensajes del chat
    const [newMessage, setNewMessage] = useState(''); // Almacena el nuevo mensaje a enviar
    const endOfMessagesRef = useRef(null); // Referencia para hacer scroll al último mensaje
    //const { user } = useUser();
    //console.log("id:", user.id);

    // Función para cargar los mensajes del chat desde la API
    const fetchMessages = async () => {
        try {
            const response = await fetch('openAI/api/listMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ threadId: threadId }),
            });

            if (!response.ok) {
                throw new Error('Error fetching messages');
            }

            const data = await response.json();
            if (data.ok) {
                setMessages(data.messages); // Asumiendo que la API devuelve un arreglo de mensajes
            } else {
                console.error('No messages found', data.error);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Función para manejar el envío de un nuevo mensaje
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Aquí podrías también incluir una llamada a otra API para enviar el nuevo mensaje
        setMessages([...messages, newMessage]);
        setNewMessage('');
    };

    // Efecto para cargar los mensajes cuando el componente se monta
    useEffect(() => {
        fetchMessages();
    }, []); // El arreglo vacío asegura que esto se ejecute solo una vez al montar el componente

    // Efecto para hacer scroll al último mensaje cuando se añade uno nuevo
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-bar">
            <div className="messages">
                {messages.map((message, index) => (
                    <p key={index}>{message}</p> // Asegúrate de que esto es compatible con cómo tu API devuelve los mensajes
                ))}
                <div ref={endOfMessagesRef} /> {/* Elemento invisible para hacer scroll */}
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                />
                <button type="submit" disabled={!newMessage.trim()}>Enviar</button>
            </form>
            
        </div>
    );
}
