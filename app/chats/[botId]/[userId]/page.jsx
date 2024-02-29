"use client";
import React, { useState, useEffect } from 'react';
import ChatLogo from '@/app/components/logo.jsx';
import { createChatThread } from '@/app/lib/actions';

export default function ChatPage() {
    const [inputMessage, setInputMessage] = useState('');
    const [threadId, setThreadId] = useState(null);
    const [error, setError] = useState('');
    const [botId, setBotId] = useState('');
    useEffect(() => {
        
        const storedBotId =sessionStorage.getItem('botId');
        if (storedBotId) {
            setBotId(storedBotId);
        }
    }, []);

    

  
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await createChatThread(botId,inputMessage);
        
        if (result && !result.error) {
            setThreadId(result.threadId);
            setError('');
            console.log("Thread creado con ID:", result.threadId);
        } else if (result && result.error) {
            setError(result.error);
        }
    };

    return (
        <main className="flex min-h-screen flex-col p-6">
            <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <ChatLogo />
            </div>
            <h1>bot : {botId}</h1>
            <div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Escribe un mensaje para iniciar el chat"
                    />
                    <button type="submit">Iniciar Chat</button>
                </form>
                {error && <p>Error: {error}</p>}
            </div>
        </main>
    );
}
