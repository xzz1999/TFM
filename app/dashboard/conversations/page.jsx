'use client';
import { lusitana,roboto} from '@/app/components/fonts';
import Bot from '@/app/components/conversation/bot';
import React, { useState } from 'react'; 
import User from '@/app/components/conversation/User';


const  conversationsPage = () => {
  const [bot, setBot] = useState("");
  const [user,setUser] = useState("");

  const handleOptionSelected = (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      setBot(selectedOption.value);
      console.log("selected option:", selectedOption);
    }
  };
  
  const handleOptionSelectedUser = (selectedOptionUser) => {
    if (selectedOptionUser && selectedOptionUser.value) {
      setUser(selectedOptionUser.value);
      console.log("selected option:", selectedOptionUser);
    }
  };
    return (
        <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{  flex: 1, paddingRight: '20px' }}> 
          <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            ASSISTANTS
          </h1>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Seleccionar el bot</h2>
          <Bot onOptionSelected={handleOptionSelected}/>
          {bot && ( // Solo renderiza User si se ha seleccionado un bot
          <>
            <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Seleccionar el usuario</h2>
            <User onOptionSelectedUser={handleOptionSelectedUser} bot={bot}/>
          </>
        )}
      </div>
    </main> 
  );
}

export default conversationsPage;