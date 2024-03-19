"use client";
import {getUsersList, getBotList} from '@/app/lib/actions';
import React, { useState, useEffect } from 'react';
import Dropdown from './dropdown';

const user = ({ onOptionSelected, bot }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (bot) {
        try {
          const userList = await getUsersList(bot);
          const formattedOptions = userList.map(user => ({
            label: user.email, 
            value: user.index.toString() 
          }));
          const OptionExtra = { label: 'Todo', value: 'todo' };
          const options = [OptionExtra, ...formattedOptions];
          setOptions(options);
        } catch (error) {
          console.error("Error al obtener la lista de usuarios:", error);
        }
      }
    };
    fetchUsers();
  }, [bot]); 
  return (
    <Dropdown options={options} onSelectionChange={onOptionSelected} />
  );
};

export default user;