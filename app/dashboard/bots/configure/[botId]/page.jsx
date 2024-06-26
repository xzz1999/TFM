"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import "./configure.css";
import { botData, filesName,updateBot, deleteBot } from '@/app/lib/actions'; 
import { lusitana, roboto } from '@/app/components/fonts';
import { Button } from '@/app/components/button';
import { useRouter} from 'next/navigation'; 

const BotData = () => {
  const [bot, setBot] = useState({ id: '', name: '', role: '', fileId: [], token: '', ai: "" });
  const [botAi, setBotAi] = useState("");
  const [fileNames, setFileNames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [newFiles, setNewFiles] = useState([]);
  const router = useRouter(); 

  useEffect(() => {
    const fetchBotData = async () => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem('selectedBotId');
        if (!id) return;

        const data = await botData(id);
        if (!data.error) {
          setBot({ id: data.Id, name: data.name, role: data.role, fileId: data.fileId || [], token: data.token, ai: data.ai });
          setBotAi(data.ai);
        } else {
          console.error(data.error);
        }
      }
    };

    fetchBotData();
  }, []);

  useEffect(() => {
    const fetchFileNames = async () => {
      if (bot.fileId.length > 0) {
        try {
          const names = await filesName(bot.fileId);
          setFileNames(names);
        } catch (error) {
          console.error("Error al obtener los nombres de los archivos:", error);
        }
      } else {
        setFileNames([]);
      }
    };

    fetchFileNames();
  }, [bot.fileId]);

  const handleInputChange = (e, field) => {
    setBot(prevBot => ({ ...prevBot, [field]: e.target.value }));
  };

  const handleRemoveFileName = async (index) => {
    const fileIdToDelete = bot.fileId[index];
    console.log("deletefile:",fileIdToDelete);
  
    try {
 
      const deleteResponse = await fetch('/api/openAI/deleteFile', {
        method: 'DELETE', 
        headers: {
          'Content-Type': 'application/json',
          'key': bot.token,
        },

        body: JSON.stringify({ fileId: fileIdToDelete }), 
      });
      
  
      if (!deleteResponse.ok) {
        throw new Error('Network response was not ok during file deletion');
      }
  
      
      const deleteResult = await deleteResponse.json();
      if (deleteResult.error) {
        console.error('Error deleting file:', deleteResult.error);
        return; 
      }
  
      
      const newFileNames = fileNames.filter((_, i) => i !== index);
      setFileNames(newFileNames);
      const newFileIds = bot.fileId.filter((_, i) => i !== index);
      setBot(prevBot => ({ ...prevBot, fileId: newFileIds }));
  
      console.log(`File with ID ${fileIdToDelete} was successfully deleted.`);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
  
  
  const handleFileChange = (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    setNewFiles(prevFile => [...prevFile, file]);
    console.log(newFiles,"new file");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const handleRemoveNewFile = (index) => {
    setNewFiles(currentFiles => currentFiles.filter((_, i) => i !== index));
  };
  const sendBotDataG =  async() => {
    console.log("enviando modificaciones de gemini");
    
  }
  
  const sendBotData =  async() => {
    console.log("Enviando datos del bot:", bot);
    switch(botAi){
      case "gpt-3.5-turbo":
      case "gpt-4-1106-preview":  
      const dataToSend = {
        Id : bot.id,
        assistantName: bot.name,
        assistantModel: bot.ai,
        assistantDescription: bot.role,
        assistantToken: bot.token,
        files:  [...bot.fileId]
      };
      try {
        for (const file of newFiles) {
          const formData = new FormData();
          formData.append('file', file); 
          const uploadResponse = await fetch('/api/openAI/uploadFile', {
            method: 'POST',
            headers: {
              'key' : bot.token,
            } ,
            body: formData,
          });
    
          if (!uploadResponse.ok) {
            throw new Error('Network response was not ok during file upload');
          }
          const uploadResult = await uploadResponse.json();
          console.log("uploadresult:",uploadResult.fileId);
      if (uploadResult.error) {
        console.error('Error uploading file:', uploadResult.error);
        continue; 
      }
     
      dataToSend.files.push(uploadResult.fileId);
    }
    
    
    try {
      const response = await fetch('/api/openAI/updateAssistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const responseData = await response.json();
        if (responseData.error) {
          console.error('Error actualizar assistente:', responseData.error);
          alert(`Error: ${responseData.error}`); 
        } else {
          console.log('assistente actualizado con exito:')
          alert('se ha actualizado correctamente');
          window.location.reload();
        }
      }catch(error){
        console.error("Error en actualizar assistente:",error);
      } 
  }catch (error) {
        console.error('Error en actualizar :', error);
        alert(`Error: ${error.message}`); 
      }
  break;
  case"Gemini 1.0 Pro":
    const data = {
    Id: bot.id,
    name: bot.name,
    ai: bot.ai,
    token: bot.token,
    role: bot.role,
    fileId: bot.fileId

    }
    try {
      const update = await updateBot(bot.id,data);
      if(update){
      alert("bot modificado exitosamente");
      window.location.reload();
      }
    }catch(e){
    alert("error en modificar el bot:",e);
    }
    break;
  case "Mistral-7B":
    try{
      const data = {
        Id: bot.id,
        name: bot.name,
        ai: bot.ai,
        role: bot.role,
        fileId: bot.fileId
      }
      const update = await updateBot(bot.id,data)
      if(update){
        alert("bot modificado exitosamente");
        window.location.reload();
        }
      }catch(e){
      alert("error en modificar el bot:",e);
      }
      break;
    default:
        alert("Modelo de IA no soportado o desconocido.");
      break;
    }
  }

    const handleDeleteBot = async () => {
      console.log("bot ai:", botAi);
      if (window.confirm('¿Estás seguro de que deseas eliminar este bot?')) {
        switch(botAi){
          case "llama3":
            try {
              const datal ={ 
                modelId: bot.id
              }
              console.log("modelId", datal);
              const response = await fetch('/api/llama/deleteModel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datal),
              })
              if (!response.ok) 
                throw new Error(data.message);
              const data = await response.json();
              if (data.error) {
                console.error('Error en eliminar assistente:', data.error);
                alert(`Error: ${data.error}`); 
                window.location.reload();
              } else {
                console.log('assistente eliminado con exito:')
                alert('se ha eliminado correctamente');
                router.push('/dashboard/bots')
              }
            } catch (error) {
              alert(`error en eliminar el bot: ${error.message}`);
              window.location.reload();
            }
            break;
          case "gemini-1.0-pro":
          case "Mistral-7B":
            try{
              await deleteBot(bot.id);
              alert('se ha eliminado correctamente');
              router.push('/dashboard/bots');
              
            }catch(e){
              console.log("error en borrar el bot:",e );
            }
            break;
            default:
              alert("Modelo de IA no soportado o desconocido.");
            break;
          } 
    }
    };
  


  if (!bot.id) return <div>Cargando datos del bot...</div>;
  const isChatGPT = bot.ai === 'gpt-3.5-turbo' || bot.ai === 'gpt-4-1106-preview';
  const isLlama3  = bot.ai === 'llama3'

  return (
    <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
          <FontAwesomeIcon icon={faRobot} className="bot-icon" />
          Bot Configuration
        </h1>
        <br />
        <div>
          <h2 className={`${roboto.className} mb-20 text-xl md:text-3xl`}>Datos de Bot:</h2>
          {isEditing ? (
            <>

              <label>ID: {bot.id}</label><br />
              <label>Nombre:</label>
              <input
                type="text"
                value={bot.name}
                onChange={(e) => handleInputChange(e, 'name')}
              /><br />
              <label>Role:</label>
              <input
                type="text"
                value={bot.role}
                onChange={(e) => handleInputChange(e, 'role')}
              /><br />
              {isChatGPT && (
                <div>Archivos Actuales:</div>
              )}
              {isChatGPT && fileNames.map((fileName, index) => (
                <div key={index}>
                  {fileName} <FontAwesomeIcon icon={faTimes} onClick={() => handleRemoveFileName(index)} />
                </div>
              ))}
            </>
          ) : (
            <>
              <p>ID: {bot.id}</p>
              <p>Nombre: {bot.name}</p>
              <p>Role: {bot.role}</p>
              {isChatGPT && (
                <div>Archivos Actuales:
                  {fileNames.map((fileName, index) => (
                    <p key={index}>{fileName}</p>
                  ))}
                </div>
              )}
            </>
          )}
          {!isChatGPT && (
            <button onClick={handleDeleteBot} style={{ color: 'red' }}>
              <FontAwesomeIcon icon={faTrash} /> Delete Bot
            </button>
          )}
          {!isLlama3 && (
          <Button onClick={toggleEdit}>{isEditing ? 'Guardar' : 'Editar'}</Button>
          )}
          {isChatGPT && (
            <>
              <div>Archivos Nuevos:</div>
              {newFiles.map((file, index) => (
                <div key={index}>
                  {file.name} <FontAwesomeIcon icon={faTimes} onClick={() => handleRemoveNewFile(index)} />
                </div>
              ))}
              <button onClick={triggerFileInput}><FontAwesomeIcon icon={faPlus} /> Añadir archivo</button>
            </>
          )}
        </div>
       
        {!isEditing  && !isLlama3 && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
            <Button onClick={ sendBotData }>Enviar</Button>
          </div>
        )}
        
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        style={{ display: 'none' }}
      />
    </main>
  );
};

export default BotData;