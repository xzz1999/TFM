'use client';
import { lusitana,roboto} from '@/app/components/fonts';
import Bot from '@/app/components/conversation/bot';
import React, { useState } from 'react'; 
import User from '@/app/components/conversation/user';
import Date from '@/app/components/conversation/date';
import { Button } from '@/app/components/button'; 
import { useRouter } from 'next/navigation';



const  conversationsPage = () => {
  const [bot, setBot] = useState("");
  const [user,setUser] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter()
  const handleOptionSelected = (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      setBot(selectedOption.value);
      console.log("selected bot option:", selectedOption);
    }
  };
  
  const handleOptionSelectedUser = (selectedOption) => {
    if (selectedOption && selectedOption.value) {
      setUser(selectedOption.label);
      console.log("selected user option:", selectedOption);
    }
    
  };
  const handleDateSelected = (selectedDate) => {
    setDate(selectedDate);
    console.log("selectedDate:",selectedDate);
  };
  const handleSubmit = () => {
    if (!bot  ) {
      alert("Por favor, seleccione un bot antes de enviar.");
      return; 
    }
    if (!user ) {
      alert("Por favor, seleccione un usuario o todos.");
      return; 
    }
    router.push(`/dashboard/conversations/visualizer?bot=${bot}&user=${user}&date=${date}`);

    
  };
  return (
    <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
      <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            Conversaciones
          </h1>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Seleccionar el bot</h2>
        <Bot onOptionSelected={handleOptionSelected}/>
        <br></br>
        {bot && (
          <>
            <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Seleccionar el usuario</h2>
            <User onOptionSelected={handleOptionSelectedUser} bot={bot} />
            <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>Seleccionar la Fecha de conversación</h2>
            <Date onDateChange={handleDateSelected}/>
          </>
        )}
        <Button onClick={handleSubmit} style={{ marginTop: '20px' }}>Enviar</Button>
      </div>
    </main>
  );
}

export default conversationsPage;