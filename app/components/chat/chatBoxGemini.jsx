import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail } from '@/app/lib/actions';
import { BsRobot, BsMic, BsMicFill, BsImage, BsX,BsCameraVideo } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";
import { setConversation, isRestricted, botData } from '@/app/lib/actions';

export default function ChatBarGemini() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const endOfMessagesRef = useRef(null);
    const searchParams = useSearchParams();
    const [botId, setBotId] = useState('');
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [showVideoModal, setShowVideoModal] = useState(false);

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
        setMessages([{ text: "Hola, ¿en qué puedo ayudarte?", sender: "bot" }]);
        const initThread = async () => {
            try {
                const correo = await getEmail(botId, user);
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
                body: JSON.stringify({ action: 'startChat' })
            });
            const data = await response.json();
            if (data) {
                return data.id;
            }
        } catch (error) {
            console.error('Error en empezar el chat:', error);
        }
    };

    const sendMessage = async (id, question) => {
        try {
            const response = await fetch('/api/Gemini/startChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                },
                body: JSON.stringify({ id, question, action: 'sendMessage' })
            });
            const data = await response.json();
            if (data) {
                const res = {
                    data: data.response,
                    time: data.time
                }
                return res;
            }
        } catch (error) {
            console.error('Error en enviar el mensaje:', error);
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
                if (data.status === "success") {
                    return true;
                } else {
                    return false;
                }
            }
        } catch (error) {
            console.error('Error en validar el mensaje:', error);
        }
    };

    const sendMultiModal = async (id, question, base64Image) => {
        try {
            const response = await fetch('/api/Gemini/multimodal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': botId
                },
                body: JSON.stringify({ id, question, base64Image, action: 'sendMultiModal' })
            });
            const data = await response.json();
            if (data) {
                const res = {
                    data: data.result,
                    time: data.time
                }
                return res;
            }
        } catch (error) {
            console.error('Error en enviar el mensaje:', error);
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
        if (!newMessage.trim() && !uploadedImage) return;
        setIsProcessing(true);
        setMessages(prevMessages => [...prevMessages, { text: newMessage, sender: "user", image: uploadedImage }]);
        setNewMessage('');
        setUploadedImage(null);
        try {
            const interaccion = {
                bot: botId,
                Time: new Date(),
                student: email,
                question: newMessage,
            };
            let response;
            if (uploadedImage) {
                response = await sendMultiModal(botId, newMessage, uploadedImage);
            } else {
                const id = await startChat();
                if (id) {
                    response = await sendMessage(id, newMessage);
                }
            }

            if (response) {
                const restricted = await isRestricted(botId);
                if (restricted) {
                    const bot = await botData(botId);
                    const valido = await validate(response.data, bot.validTopics, bot.invalidTopics);
                    if (valido) {
                        console.log(response.time)
                        interaccion.answer = response.data;
                        interaccion.responseTime = response.time;
                        setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]);
                    } else {
                        interaccion.answer = "lo siento, no puedo responderte acerca de este tema";
                        interaccion.responseTime = response.time;
                        setMessages(prevMessages => [...prevMessages, { text: "lo siento, no puedo responderte acerca de este tema", sender: "bot" }]);
                    }
                } else {
                    interaccion.answer = response.data;
                    interaccion.responseTime = response.time;
                    setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]);
                }
                await setConversation(interaccion);
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

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Tu navegador no soporta la API de reconocimiento de voz');
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.error('No se seleccionó ningún archivo');
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
                    disabled={isProcessing}
                />
                <button type="submit" disabled={!newMessage.trim() && !uploadedImage || isProcessing}>Enviar</button>
                <button type="button" onClick={toggleRecording} className={`mic-button ${isRecording ? 'recording' : ''}`}>
                    {isRecording ? <BsMicFill /> : <BsMic />}
                    {isRecording && <div className="mic-animation"></div>}
                </button>
            </form>
        </div>
    );
}
