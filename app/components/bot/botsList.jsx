"use client";
import React, { useEffect, useState } from 'react';
import { getBot } from '@/app/lib/actions';
import { useRouter,useSearchParams} from 'next/navigation'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './BotList.css';

const BotList = () => {
  const [bots, setBots] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const router = useRouter(); 
  //const [searchParams, setSearchParams] = useSearchParams();

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
      console.log(botId);
      //setSearchParams("botId",botId);
      router.push(`/chats?botId=${botId}`);
      //router.push(`/chats?botId=${botId}`);
      //localStorage.setItem('selectedBotId', botId);
   
    
    } else if (action === 'configure'){
      router.push(`/dashboard/bots/configure/${botId}`)
      console.log("configurar bot:",botId);
      localStorage.setItem('selectedBotId', botId);

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
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BotList;
