"use client";
import React from 'react';
import ChatLogo from '@/app/components/logo.jsx';
import ChatBar from '@/app/components/chat/chatBox';


export default function ChatPage() {


    return (
        <main className="flex min-h-screen flex-col p-6">
            <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <ChatLogo />
            </div>
            <ChatBar />
        </main>
    );
}
