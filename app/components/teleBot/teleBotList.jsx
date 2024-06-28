"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getRunningTele, botData, deleteTelegram } from '@/app/lib/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { TbRobot } from "react-icons/tb";
import './teleBotList.css';

const TeleBotList = () => {
  const [bots, setBots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptions, setShowOptions] = useState(null);

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const botsData = await getRunningTele();
        const botsWithDetails = await Promise.all(botsData.map(async (bot) => {
            const botDetails = await botData(bot.botAsociado);
            return { ...bot, nombreAsociado: botDetails.name };
          }));
        setBots(botsWithDetails);
      } catch (error) {
        console.error("Error al obtener la lista de bots de Telegram:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBots();
  }, []);

  const handleOptionsToggle = (botToken) => {
    setShowOptions(showOptions === botToken ? null : botToken);
  };

  const handleDelete = async (botToken) => {
    try {
      const response = await  fetch('/api/deletebot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: botToken })
      });
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      const eliminar = await deleteTelegram(botToken);
      if(eliminar) {
      window.alert('Bot eliminado con éxito');
      window.location.reload();
      setBots(bots.filter(bot => bot.token !== botToken));
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
    }
    setShowOptions(null);
  };

  return (
    <div className="telebot-list">
      {isLoading ? (
        <div className="loading-message">Cargando...</div>
      ) : (
        bots.length === 0 ? (
          <div className="no-bots-message">
            <TbRobot className="no-bots-icon" />
            <div className="no-bots-text">No hay bots en ejecución en este momento.</div>
            <div className="no-bots-subtext">Por favor, agrega un bot para comenzar.</div>
          </div>
        ) : (
          bots.map((bot) => (
            <div key={bot.token} id={`bot-${bot.token}`} className="telebot-card">
              <TbRobot className="telebot-icon" />
              <div>
                <div className="telebot-name">{bot.name}</div>
                <div>{bot.nombre}</div>
                <div className="telebot-asociado">(Bot asociado: {bot.nombreAsociado})</div>
              </div>
              <FontAwesomeIcon icon={faEllipsisV} onClick={() => handleOptionsToggle(bot.token)} className="options-icon-telebot" />
              {showOptions === bot.token && (
                <div className="options-menu-telebot">
                  <button onClick={() => handleDelete(bot.token)}>Eliminar</button>
                </div>
              )}
            </div>
          ))
        )
      )}
    </div>
  );
};

export default TeleBotList;
