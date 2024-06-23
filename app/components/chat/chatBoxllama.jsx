import { useEffect, useRef, useState } from 'react';
import './chatBox.css';
import { useSearchParams } from 'next/navigation';
import { getEmail, setConversation, isRestricted, botData } from '@/app/lib/actions';
import { BsRobot, BsMic, BsMicFill, BsCameraVideo } from "react-icons/bs";
import { PiStudent } from "react-icons/pi";
import { FaRegFilePdf } from "react-icons/fa6";

export default function ChatBarLlama() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
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
    const [fileToSummary, setFileToSummary] = useState(null);

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

    const transcriptVideo = async (url) => {
        try {
            const dataToSend = { url: url };
            const response = await fetch('/api/transcriptor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            if (data.status === "error") {
                return { status: "error", message: data.message };
            }
            return { status: "success", messages: data.text };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    };

    const resumenVideo = async (text) => {
        try {
            const dataToSend = { text: text };
            const response = await fetch('/api/openAI/videoSumary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
    };

    const sendMessage = async (id, question) => {
        try {
            const data = { modelId: id, message: question };
            const response = await fetch('/api/llama/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.data) {
                return { data: result.data, time: result.time };
            }
        } catch (error) {
            console.error('Error en enviar el mensaje:', error);
        }
    };

    const validate = async (mensaje, topics, invalidTopics) => {
        try {
            const dataToSend = { message: mensaje, topics: topics, invalidTopics: invalidTopics };
            const response = await fetch('/api/Guardrail/sendMensaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            return data.status === "success";
        } catch (error) {
            console.error('Error en validar el mensaje:', error);
        }
    };

    const pdfToText = async (file) => {
        console.log("comienzando convertir archivo")
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result?.toString().split(",")[1];
            try {
                const response = await fetch('http://localhost:3001/api/resumir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64})
                });
                const result = await response.json();
                return result.status === "error" ? { status: "error", message: result.message } : { status: "success", message: result.message };
            } catch (error) {
                return { status: "error", message: error.message };
            }
        };
    };

    const dividirTexto = async (texto) => {
        try {
            const dataToSend = { text: texto };
            const response = await fetch('/api/FileExtractor/dividirText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            return data.status === "error" ? { status: "error", message: data.message } : { status: "success", message: data.messages };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    };

    const getResumen = async (texto) => {
        try {
            const dataToSend = { text: texto };
            const response = await fetch('/api/FileExtractor/getResumen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            return data.status === "error" ? { status: "error", message: data.message } : { status: "success", message: data.message };
        } catch (error) {
            return { status: "error", message: error.message };
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

            const response = await sendMessage(botId, newMessage);
            const restricted = await isRestricted(botId);
            if (response) {
                if (restricted) {
                    const bot = await botData(botId);
                    const valido = await validate(response.data, bot.validTopics, bot.invalidTopics);
                    if (valido) {
                        interaccion.answer = response.data;
                        interaccion.responseTime = response.time;
                        setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]);
                        await setConversation(interaccion);
                    } else {
                        interaccion.answer = "Lo siento, no puedo responderte acerca de este tema.";
                        interaccion.responseTime = response.time;
                        setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no puedo responderte acerca de este tema.", sender: "bot" }]);
                        await setConversation(interaccion);
                    }
                } else {
                    interaccion.answer = response.data;
                    interaccion.responseTime = response.time;
                    setMessages(prevMessages => [...prevMessages, { text: response.data, sender: "bot" }]);
                    await setConversation(interaccion);
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

    const handleVideoUrlSubmit = async (e) => {
        e.preventDefault();
        setShowVideoModal(false);
        setMessages(prevMessages => [...prevMessages, { text: videoUrl, sender: "user" }]);
        const text = await transcriptVideo(videoUrl);
        if (text.status === "error") {
            setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no puede realizar resumen de este texto.", sender: "bot" }]);
            setVideoUrl('');
            return;
        } else {
            const result = await resumenVideo(text.messages);
            setMessages(prevMessages => [...prevMessages, { text: result, sender: "bot" }]);
            setVideoUrl('');
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessages(prevMessages => [...prevMessages, { text: file.name, sender: "user" }]);
            setFileToSummary(file);
            const result = await pdfToText(file);
            if (result && result.status === "success") {
                const dividir = await dividirTexto(result.message);
                if (dividir && dividir.status === "success") {
                    const textos = dividir.message;
                    const resumenes = [];
                    for (const texto of textos) {
                        const resumen = await getResumen(texto);
                        if (resumen && resumen.status === "success") {
                            resumenes.push(resumen.message);
                        } else {
                            console.error("Error en obtener resumen:", resumen?.message);
                            setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no he sido capaz de resumir el PDF.", sender: "bot" }]);
                            return;
                        }
                    }
                    const finalSummary = resumenes.join("\n");
                    setMessages(prevMessages => [...prevMessages, { text: finalSummary, sender: "bot" }]);
                } else {
                    console.error("Error en dividir el texto:", dividir?.message);
                    setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no he sido capaz de resumir el PDF.", sender: "bot" }]);
                }
            } else {
                console.error("Error en convertir el archivo:", result?.message);
                setMessages(prevMessages => [...prevMessages, { text: "Lo siento, no he sido capaz de resumir el PDF.", sender: "bot" }]);
            }
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
            {showVideoModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setShowVideoModal(false)}>&times;</span>
                        <form onSubmit={handleVideoUrlSubmit}>
                            <label>Introduce la URL del video:</label>
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
                <label className="image-upload-label">
                    <FaRegFilePdf size={24} />
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfUpload}
                        style={{ display: 'none' }}
                    />
                </label>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    disabled={isProcessing}
                />
                <button type="submit" disabled={!newMessage.trim() || isProcessing}>Enviar</button>
                <button type="button" onClick={toggleRecording} className={`mic-button ${isRecording ? 'recording' : ''}`}>
                    {isRecording ? <BsMicFill /> : <BsMic />}
                    {isRecording && <div className="mic-animation"></div>}
                </button>
            </form>
        </div>
    );
}
