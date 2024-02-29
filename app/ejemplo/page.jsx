"use client";
import Head from 'next/head';
import CreateChatThread from '../ui/chat/prueba'; // Ajusta la ruta de importación según tu estructura de directorios

export default function Home() {
  return (
    <div>
      <Head>
        <title>Crear Hilo de Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Crear un Nuevo Hilo de Chat</h1>
        <CreateChatThread />
      </main>
    </div>
  );
}
