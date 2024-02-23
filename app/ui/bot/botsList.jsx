"use client";
import React, { useEffect, useState } from 'react';
import { getBot } from '@/app/lib/actions';
import { useRouter } from 'next/navigation'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './BotList.css';

const BotList = () => {
  const [bots, setBots] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const router = useRouter(); 

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botsData = await getBot();
        setBots(botsData);
      } catch (error) {
        console.error("Error al obtener la lista de bots:", error);
      }
    };

    fetchBots();
  }, []);

  const handleOptionsToggle = (botId) => {
    setShowOptions(showOptions === botId ? null : botId);
  };

  const handleAction = (action, botId) => {
    if (action === 'chat') {
      // Usa el router para navegar a la URL deseada
      router.push('/chats/${botId}');
    } else {
      console.log(action, 'action performed for bot ID:', botId);
      // Aquí puedes implementar la lógica para manejar las demás acciones
    }
  };

  return (
    <div className="bot-list">
      {bots.map((bot) => (
        <div key={bot.Id} className="bot-card">
          <FontAwesomeIcon icon={faRobot} className="bot-icon" />
          <div>
            <div className="bot-name">{bot.name}</div>
            <div>(ID: {bot.Id})</div>
          </div>
          <FontAwesomeIcon icon={faEllipsisV} onClick={() => handleOptionsToggle(bot.Id)} className="options-icon" />
          {showOptions === bot.Id && (
            <div className="options-menu">
              <button onClick={() => handleAction('chat', bot.Id)}>Chat</button>
              <button onClick={() => handleAction('configure', bot.Id)}>Configurar</button>
              <button onClick={() => handleAction('delete', bot.Id)}>Eliminar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BotList;
