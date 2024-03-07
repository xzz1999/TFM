    "use client";
    import React from 'react';
    import FormularioCorreo from '@/app/components/chat/login'; 
    import ChatLogo from '@/app/components/logo.jsx';
    
    
    export default function Home() {

           
        return (
            <main className="flex min-h-screen flex-col p-6">
                <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                    <ChatLogo />
                </div>
              
                <FormularioCorreo  />

                
            </main>
        );
    }
