"use client";
import React from 'react';
import ChatLogo from '@/app/components/logo.jsx';
import ChatBarOpenAI from '@/app/components/chat/chatBoxOpenAI';
import ChatBarGemini from '@/app/components/chat/chatBoxGemini';
import ChatBarLlama from '@/app/components/chat/chatBoxllama';
import ChatBarMistral from'@/app/components/chat/chatboxMistral';
import {useSearchParams} from 'next/navigation'
import { botData } from '@/app/lib/actions';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';


function ChatComponent() {
    const searchParams = useSearchParams();
    const [botId,setBotId] = useState("");
    const [ai, setAi] = useState("");
    useEffect(() => {
        const Id = searchParams.get('botId')
        setBotId(Id)
        console.log(botId);
    },  []);
    useEffect(() => {
        api(botId);
    },  [botId]);

    const api = async(botId)=> {
        try{
            const bot = await botData(botId);
            if(bot){
                setAi(bot.ai);
                console.log(bot.ai);
            }
    
        }catch(e){
            console.log("error en buscar el bot:",e);
        }

    }
    const isChatGPT = ai === 'gpt-3.5-turbo' || ai === 'gpt-4-1106-preview';
    const isGemini = ai === 'Gemini 1.0 Pro'
    const isLlama = ai === 'llama3'
    const isMistral = ai === 'Mistral-7B'


    return (
        <main className="flex min-h-screen flex-col p-6">
            <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <ChatLogo />
            </div>
            {isChatGPT && <ChatBarOpenAI />}
            {isGemini && <ChatBarGemini />}
            {isLlama && <ChatBarLlama />}
            {isMistral && <ChatBarMistral/>}

        </main>
    );
}
export default function ChatPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ChatComponent />
      </Suspense>
    );
  }
