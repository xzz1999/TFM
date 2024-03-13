        import { useEffect, useRef, useState } from 'react';
        import './chatBox.css';
        import { useRouter, useSearchParams } from 'next/navigation';
        import { getHilo } from '@/app/lib/actions';
        import { BsRobot  } from "react-icons/bs";
        import { PiStudent } from "react-icons/pi";


        export default function ChatBar() {
            const router = useRouter();
            const [messages, setMessages] = useState([]);
            const [newMessage, setNewMessage] = useState('');
            const endOfMessagesRef = useRef(null);
            const searchParams = useSearchParams();
            const [botId, setBotId] = useState('');
            const [threadId, setThreadId] = useState('');
            const [user, setUser] = useState('');
            const [runId, setRunId] = useState('');
            const [isLoading, setIsLoading] = useState(true);

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
                if (!botId || !user) return;

                const initThread = async () => {
                    const correo = user + "@alumnos.upm.es";
                    try {
                        const hilo = await getHilo(botId, correo);
                        console.log(hilo);
                        setThreadId(hilo);
                    } catch (error) {
                        console.error("Error en encontrar threadId:", error);
                    }
                };

                initThread();
            }, [botId, user]);

            useEffect(() => {
                if (!botId || !threadId) return;
                const initAssistant = async ()=>{
                    setIsLoading(true);
                    try{
                    const run = await runAssistant (botId,threadId);
                    setRunId(run)
                    setIsLoading(false);
                    }catch(error){
                        console.log("error en ejecutar el asistente:",error);
                    }
   
            };
               initAssistant()
            }, [botId, threadId]);
            useEffect(() => {
                if(!runId) return;
                    setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "bot" }]);

            },[runId]);
            // LISTAR LOS MENSAJES DE ASSISTENTE
            const fetchMessages = async (hilo) => {
                try {
                    const response = await fetch('/api/openAI/listMessages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'id': botId
                        },
                        body: JSON.stringify( hilo),
                    });

                    if (!response.ok) {
                        throw new Error('Error fetching messages');
                    }

                    const data = await response.json();
                    if (data) {
                        console.log("data:",data);
                        //setMessages(prevMessages => [...prevMessages, ...data.messages.map(msg => ({text: msg, sender: "user"}))]);
                    } else {
                        console.error('No messages found', data.error);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            };
            // ENVIAR MENSAJE A API DE OPENAI
            const enviarMensaje = async (mensaje)=>{

                try {
                
                const response = await fetch('/api/openAI/addMessage', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'id': botId
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
            // EJECUTAR ASSISNTENTE EN OPENAI
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
                      'id': botId
                    },
                    body: JSON.stringify(requestBody),
                  });
                  if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                  }
                  const data = await response.json();
                  return data.runId;
                } catch (error) {
                  console.error('error en ejecutar el asistente:', error.message);
                }
              }
              // CHECKEAR SI EL ASSISTENTE SIGUEN EN EJECUCION
              const  checkAssistant = async (threadId, runId) =>{
                try {
                  
                  const requestBody = {
                    runId: runId,
                    threadId: threadId,
                  };
                  const response = await fetch('/api/openAI/checkRunStatus', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'id': botId
                    },
                    body: JSON.stringify(requestBody),
                  });
                  if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                  }
                  const data = await response.json();
                  return data;
                } catch (error) {
                  console.error('error en ejecutar el asistente:', error.message);
                }
              }
            

            const handleSendMessage = async (e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                setMessages([...messages, {text: newMessage, sender: "user"}]);
                try{
                    const check  = await checkAssistant(threadId,runId);
                    
                    if(check.status == "completed"){

                        const mensaje ={
                            'threadId' : threadId,
                            'input': newMessage 
                        }
                        try{
                            await enviarMensaje (mensaje);

                        }catch(error){
                            console.log("error en mandar el mensaje:",error);
                        }
                        setNewMessage('');
                        try{
                            const id ={
                                "threadId" : threadId,
                                "runId": runId
                            }

                            const mensajes = await fetchMessages(id);
                            console.log("mensajes:", mensajes.messages);
        
                        }catch(error){
                            console.log("error en obtener respuestas:", error);
                        }
                        }else{
                    try{
                    const newRunId = await runAssistant(botId, threadId);
                    setRunId(newRunId);
                    console.log("Nuevo runId:", newRunId);
                    return handleSendMessage(e);
                    }catch(error){
                        console.log("error en volver a ejecutar el assistente:", error);
                    }
                }

                    
                }catch(error){
                    console.log("error en checkear el assistente:", error); 
                    
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
                                <p>{message.text}</p>
                                <PiStudent className="user-icon" />
                            </>
                        )}
                    </div>
                ))}
                <div ref={endOfMessagesRef} />
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