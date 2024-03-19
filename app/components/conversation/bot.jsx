"use client";
import {getBotList} from '@/app/lib/actions';
import React, { useState, useEffect } from 'react';
import Dropdown from './dropdown';

const bot = ({ onOptionSelected }) => {
    const [options, setOptions] = useState([]);
    useEffect(() => {
        const fetchBots = async () => {
          try {
            const botList = await getBotList();
            const formattedOptions = botList.map(bot => ({
              label: bot.name, 
              value: bot.id 
            }));
            console.log("bot, formattedOptions:", formattedOptions);
            setOptions(formattedOptions);
          } catch (error) {
            console.error("Error al obtener la lista de bots:", error);
          }
        };
        fetchBots();
      }, []); 

  return (
    <div>
      <Dropdown options={options} onSelectionChange={onOptionSelected} />
    </div>
  );
};

export default bot;
