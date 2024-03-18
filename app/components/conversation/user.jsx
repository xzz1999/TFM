"use client";
import {getUsersList} from '@/app/lib/actions';
import React, { useState, useEffect } from 'react';
import Dropdown from './dropdown';

const users = ({ onOptionSelectedUser, bot}) => {
    const [options, setOptions] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
          console.log("Bot:", bot);
          if(bot){
            try {
                const botList = await getUsersList(bot);
                const formattedOptions = botList.map(user => ({
                  label: user.email, 
                  value: user.index 
                }));
                setOptions(formattedOptions);
              } catch (error) {
                console.error("Error al obtener la lista de bots:", error);
              }
          }
          
        };
        fetchUsers();
      }, []); 

  return (
    <div>
      <Dropdown options={options} onSelectionChange={onOptionSelectedUser} />
    </div>
  );
};

export default users;
