"use client";
import React, { useState, useEffect } from 'react';
import FormularioCorreo from '@/app/ui/chat/login'; // Asegúrate de que la ruta sea correcta
import ChatLogo from '@/app/ui/logo.jsx';
import { addUsers, addMessage, getHilo } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';


export default function Home() {
    const [correo, setCorreo] = useState('');
    const [id, setId] = useState('');
    const [user, setUser] = useState('');
    const router = new useRouter;

    useEffect(() => {
        const botId = localStorage.getItem('selectedBotId');
        if (botId) {
            setId(botId);
        }
    }, []);

    useEffect(() => {
        // Esta función se ejecuta cada vez que 'correo' se actualiza.
        const handleAddUser = async () => {
            if (correo && id) {
                try {
                    const name = correo.split("@")[0];
                    setUser(name);
                    const response = await addUsers(id, correo);
                    if (response !== undefined) {
                        const hilo = await getHilo(id,correo);
                        const mensaje = {
                            threadId: hilo,
                            input: "hola",
                        }
                        
                        try{
                        const primerMensaje= addMessage(mensaje,id);
                        console.log("primerMensaje",primerMensaje);
                        }catch(error){
                        console.log("error en insertar el primer mensaje",mensaje);
                        }
                        
                        setCorreo(''); // Resetear el campo de correo después de agregar
                        router.push(`/chats/${id}/${name}`); 

                    } 
                } catch (error) {
                    console.error('Error al añadir el usuario:', error);
                }
            }
        };

        if (correo) {
            handleAddUser();
        }
    }, [correo, id]); // Observar cambios en 'correo' y 'id'

    return (
        <main className="flex min-h-screen flex-col p-6">
            <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
                <ChatLogo />
            </div>
            <FormularioCorreo setCorreo={setCorreo} />
        </main>
    );
}
