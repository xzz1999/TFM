import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail, setConversation } from '@/app/lib/actions';
import { getHilo, isRestricted, botData } from '@/app/lib/actions';
import { BsRobot, BsMic, BsMicFill, BsImage, BsX, BsCameraVideo} from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { PiStudent } from "react-icons/pi";
import axios from 'axios';



export default function ChatBar() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [showVideoModal, setShowVideoModal] = useState(false);
    const endOfMessagesRef = useRef(null);
    const searchParams = useSearchParams();
    const [botId, setBotId] = useState('');
    const [threadId, setThreadId] = useState('');
    const [user, setUser] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const botIdValue = searchParams.get('botId') || "";
        const userValue = searchParams.get('user') || "";
        if (!botIdValue || !userValue) {
            console.error("Bot ID or user not found.");
            return;
        }
        setBotId(botIdValue);
        setUser(userValue);
    }, [searchParams]);

    useEffect(() => {
        if (!botId || !user) return;

        const initThread = async () => {
            const correo = await getEmail(botId, user);
            setIsLoading(true);
            try {
                const hilo = await getHilo(botId, correo);
                setThreadId(hilo);
                setIsLoading(false);
            } catch (error) {
                console.error("Error finding threadId:", error);
            }
        };

        initThread();
    }, [botId, user]);

    useEffect(() => {
        if (!threadId) return;
        setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "bot" }]);
    }, [threadId]);

    const fetchMessages = async (hilo) => {
        try {
            const response = await fetch('/api/openAI/listMessages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                },
                body: JSON.stringify(hilo),
            });

            if (!response.ok) {
                throw new Error('Error fetching messages');
            }

            const data = await response.json();
            if (data) {
                return data.messages.text.value;
            } else {
                console.error('No messages found', data.error);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const enviarMensaje = async (mensaje) => {
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
                console.log('Message added successfully:', result);
            } else {
                console.error('Error adding message:', result.error);
            }
        } catch (error) {
            console.error('Error in the request:', error);
        }
    }

    const runAssistant = async (assistantId, threadId) => {
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
            console.error('Error running the assistant:', error.message);
        }
    }

    const checkAssistant = async (threadId, runId) => {
        try {
            const requestBody = { runId, threadId };
            const response = await fetch('/api/openAI/checkRunStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'id': botId },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            if (data.status !== "completed") {
                console.log("Assistant still running, checking again...");
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkAssistant(threadId, runId);
            }
            return data;
        } catch (error) {
            console.error('Error checking the assistant status:', error.message);
        }
    };

    const validate = async (mensaje, topics, invalidTopics) => {
        try {
            const dataToSend = {
                message: mensaje,
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
                return data.status === "success";
            }
        } catch (error) {
            console.error('Error starting the chat:', error);
        }
        return false;
    };

    const sendMultimodal = async (mensaje, imagen, token) => {
        try {
            const dataToSend = {
                token: token,
                message: mensaje,
                image: imagen
            }
            const response = await axios.post('/api/openAI/MultiModal', dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = response.data;
            if (data.error) {
                throw new Error(data.error);
            }
            return data.response.message.content;
        } catch (error) {
            return error.message ;
        }
    };
    const transcriptVideo = async (url) => {
        try {
            const dataToSend = {
                url: url
            }
            const response = await fetch('/api/transcriptor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json(); 
            if (data.status === "error") {
                return {
                    status: "error",
                    message: data.message
                }
            
            }
            return {
                status: "success",
                messages:data.text

            }
        } catch (error) {
            return error.message;
        }
    }
    const resumenVideo = async (text) => {
        try {
            const dataToSend = {
                text: text
            }
            const response = await fetch('/api/openAI/videoSumary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.response;
        } catch (error) {
            return error.message;
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const correo = await getEmail(botId, user);
        const interaccion = {
            bot: botId,
            Time: new Date(),
            student: correo
        }
        if (!newMessage.trim() && !uploadedImage && !videoUrl) return;
        setMessages(prevMessages => [...prevMessages, { text: newMessage, sender: "user", image: uploadedImage, video: videoUrl }]);
        interaccion.question = newMessage;
        setNewMessage('');
        setUploadedImage(null);
        setVideoUrl('');
        setIsProcessing(true);

        try {
            const mensaje = {
                'threadId': threadId,
                'input': newMessage,
                'base64Image': uploadedImage ? uploadedImage.split(',')[1] : null,
            }

            let mensajes;
            let startTime;
            let endTime;
            let responseTime;

            if (uploadedImage) {
                const bot = await botData(botId);
                startTime = Date.now();
                mensajes = await sendMultimodal(newMessage, uploadedImage, bot.token);
                endTime = Date.now();
            } else {
                await enviarMensaje(mensaje);
                const id = await runAssistant(botId, threadId);
                if (id) {
                    await checkAssistant(threadId, id);
                    const conversation = {
                        "threadId": threadId,
                    }
                    mensajes = await fetchMessages(conversation);
                }
            }

            responseTime = endTime - startTime;
            const restricted = await isRestricted(botId);
            if (mensajes) {
                if (restricted) {
                    const bot = await botData(botId);
                    const valido = await validate(mensajes, bot.validTopics, bot.invalidTopics);
                    if (valido) {
                        interaccion.answer = mensajes;
                        interaccion.responseTime = responseTime;
                        setIsProcessing(false);
                        setMessages(prevMessages => [...prevMessages, { text: mensajes, sender: "bot" }]);
                        await setConversation(interaccion);
                    } else {
                        interaccion.answer = "Lo siento, no puedo responderte acerca de este tema";
                        interaccion.responseTime = responseTime;
                        setIsProcessing(false);
                        setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no puedo responderte acerca de este tema", sender: "bot" }]);
                        await setConversation(interaccion);
                    }
                } else {
                    interaccion.answer = mensajes;
                    interaccion.responseTime = responseTime;
                    setIsProcessing(false);
                    setMessages(prevMessages => [...prevMessages, { text: mensajes, sender: "bot" }]);
                    await setConversation(interaccion);
                }
            }
        } catch (error) {
            console.log("Error during execution:", error);
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support the Speech Recognition API');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        recognitionRef.current = recognition;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setNewMessage(transcript);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsRecording(false);
        };

        recognition.start();
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleImageUpload = async (e) => {
        const info = await botData(botId);
        if (info.ai !== "gpt-4-1106-preview") {
            window.alert("This bot does not support images");
            return;
        }
        const file = e.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setUploadedImage(reader.result);
        };
    };

    const removeImage = () => {
        setUploadedImage(null);
    };

    const handleVideoUrlSubmit = async (e) => {
        e.preventDefault();
        setShowVideoModal(false);
        setMessages(prevMessages => [...prevMessages, { text: videoUrl, sender: "user" }]);
        const text= await transcriptVideo(videoUrl);
        if(text.status === "error"){
            setMessages(prevMessages => [...prevMessages, { text: "lo siento, no puede realizar resumen de este texto", sender: "bot" }]);
            setVideoUrl('');
            return;
        }else{
        const result  = await resumenVideo(text.messages);
        setMessages(prevMessages => [...prevMessages, { text: result, sender: "bot" }]);
        setVideoUrl('');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-animation">
                    <p>Loading...</p>
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
                                {message.image && <img src={message.image} alt="Uploaded" className="message-image" />}
                                {message.video && <a href={message.video} target="_blank" rel="noopener noreferrer">Video</a>}
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
            {uploadedImage && (
                <div className="image-preview">
                    <img src={uploadedImage} alt="Uploaded Image" />
                    <button onClick={removeImage} className="remove-image-button">
                        <BsX />
                    </button>
                </div>
            )}
            {showVideoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowVideoModal(false)}>&times;</span>
                        <form onSubmit={handleVideoUrlSubmit}>
                            <label>Enter Video URL:</label>
                            <input
                                type="url"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                required
                            />
                            <button type="submit" className="submit-button">Enviar</button>
                        </form>
                    </div>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="message-form">
                <button type="button" onClick={() => setShowVideoModal(true)} className="video-button">
                    <BsCameraVideo size={24} />
                </button>
                <input
                    type="file"
                    id="image-upload"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    accept="image/*"
                />
                <label htmlFor="image-upload" className="image-upload-label">
                    <BsImage size={24} />
                </label>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                />
                <button type="submit" disabled={!newMessage.trim() && !uploadedImage && !videoUrl}>Enviar</button>
                <button type="button" onClick={toggleRecording} className={`mic-button ${isRecording ? 'recording' : ''}`}>
                    {isRecording ? <BsMicFill /> : <BsMic />}
                    {isRecording && <div className="mic-animation"></div>}
                </button>
            </form>
        </div>
    );
}
