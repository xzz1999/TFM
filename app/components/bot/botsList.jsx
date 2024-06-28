"use client"
import React, { useEffect, useState } from 'react';
import { isFreeTelegramBot, setTelegramBot, geturl, getBot } from '@/app/lib/actions';
import { useRouter } from 'next/navigation'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './BotList.css';

const BotList = () => {
  const [bots, setBots] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [showChatOptions, setShowChatOptions] = useState(null);
  const [showChatSubOptions, setShowChatSubOptions] = useState(null);
  const [botUrl, setBotUrl] = useState(null); // Estado para almacenar la URL del bot
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
    setShowChatSubOptions(null);
  };

  const handleAction = async (action, botId) => {
    if (action === 'chat') {
      setShowChatSubOptions(showChatSubOptions === botId ? null : botId);
    } else if (action === 'configure') {
      router.push(`/dashboard/bots/configure/${botId}`);
      localStorage.setItem('selectedBotId', botId);
    }
  };

  const handleChatOption = async (option, botId) => {
    if (option === 'webpage') {
      router.push(`/chats?botId=${botId}`);
    } else if (option === 'telegram') {
      try {
        const telegramBot = await isFreeTelegramBot();
        if (telegramBot) {
          const response = await fetch('http://localhost:3003/api/createbot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: telegramBot })
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          console.log("data:", data)
          if (data.status === "success") {
            const url = await geturl(telegramBot);
            console.log("url:", url)
            setBotUrl(url);
            await setTelegramBot(telegramBot, botId);
          }
        }else{
          window.alert("No queda disponible. Porfavor, libere algún bot en el panel de telegramBot")
          window.location.reload()
        }
      } catch (error) {
        console.error('Error creating bot:', error);
      }
    }
    setShowChatSubOptions(null);
  };

  const getOptionsMenuClass = (botId) => {
    const botElement = document.getElementById(`bot-${botId}`);
    if (botElement) {
      const rect = botElement.getBoundingClientRect();
      if (rect.right + 150 > window.innerWidth) {
        return 'options-menu adjust-left'; 
      }
    }
    return 'options-menu'; 
  };

  const closeModal = () => {
    setBotUrl(null); // Función para cerrar la ventana emergente (modal)
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(botUrl);
    alert('URL copiada al portapapeles');
  };

  return (
    <div className="bot-list">
      {bots.map((bot) => (
        <div key={bot.Id} id={`bot-${bot.Id}`} className="bot-card">
          <FontAwesomeIcon icon={faRobot} className="bot-icon" />
          <div>
            <div className="bot-name">{bot.name}</div>
            <div>(ID: {bot.Id})</div>
          </div>
          <FontAwesomeIcon icon={faEllipsisV} onClick={() => handleOptionsToggle(bot.Id)} className="options-icon" />
          {showOptions === bot.Id && (
            <div className={getOptionsMenuClass(bot.Id)}>
              <button onClick={() => handleAction('chat', bot.Id)}>Chat</button>
              <button onClick={() => handleAction('configure', bot.Id)}>Configurar</button>
              {showChatSubOptions === bot.Id && (
                <div className="chat-sub-options">
                  <button onClick={() => handleChatOption('webpage', bot.Id)}>Webpage</button>
                  <button onClick={() => handleChatOption('telegram', bot.Id)}>Telegram</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {botUrl && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>URL del bot de Telegram:</p>
            <p>{botUrl}</p>
            <button className="copy-button" onClick={copyToClipboard}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotList;
