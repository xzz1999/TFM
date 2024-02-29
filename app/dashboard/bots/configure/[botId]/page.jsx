"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import "./configure.css";
import { botData, filesName,fileId, deleteFile } from '@/app/lib/actions'; // Asegúrate de implementar uploadFile en tus acciones
import { lusitana, roboto } from '@/app/components/fonts';
import { Button } from '@/app/components/button';

const BotData = () => {
  const [bot, setBot] = useState({ id: '', name: '', role: '', fileId: [], token: '', ai: "" });
  const [fileNames, setFileNames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchBotData = async () => {
      if (typeof window !== "undefined") {
        const id = localStorage.getItem('selectedBotId');
        if (!id) return;

        const data = await botData(id);
        if (!data.error) {
          setBot({ id: data.Id, name: data.name, role: data.role, fileId: data.fileId || [], token: data.token, ai: data.ai });
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
        setFileNames([]); // Asegura que fileNames esté vacío si bot.fileId lo está
      }
    };

    fetchFileNames();
  }, [bot.fileId]);

  const handleInputChange = (e, field) => {
    setBot(prevBot => ({ ...prevBot, [field]: e.target.value }));
  };

  const handleRemoveFileName = async (index) => {
    // Obtén el fileId del archivo a eliminar
    const fileIdToDelete = bot.fileId[index];
    console.log("deletefile:",fileIdToDelete);
  
    try {
      // Llama a la API de eliminación de archivos
      const deleteResponse = await fetch('/api/deleteFile', {
        method: 'DELETE', // o 'DELETE', dependiendo de tu implementación del servidor
        headers: {
          'Content-Type': 'application/json',
          'key': bot.token, // Asegúrate de que la autenticación se maneje según tus requisitos
        },

        body: JSON.stringify({ fileId: fileIdToDelete }), // Envía el fileId en el cuerpo de la solicitud
      });
      
  
      if (!deleteResponse.ok) {
        throw new Error('Network response was not ok during file deletion');
      }
  
      // Si la API devuelve un error, podrías manejarlo aquí.
      const deleteResult = await deleteResponse.json();
      if (deleteResult.error) {
        console.error('Error deleting file:', deleteResult.error);
        return; // Detén la ejecución si hay un error
      }
  
      // Si la eliminación es exitosa, actualiza los estados
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
  
  const sendBotData =  async() => {
    console.log("Enviando datos del bot:", bot);
    
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
          formData.append('file', file); // Asegúrate de que 'file' coincida con lo que tu endpoint de subida espera
          const uploadResponse = await fetch('/api/uploadFile', {
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
        // Maneja este error como prefieras
        continue; // O maneja el error de otra manera
      }
      // Suponiendo que el endpoint de subida devuelve el ID o URL del archivo subido
      dataToSend.files.push(uploadResult.fileId);
    }
    console.log("datatosendfile:",dataToSend.files);
    console.log("dataToSend",dataToSend);
    
      try {
        const response = await fetch('/api/updateAssistant', {
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
          alert(`Error: ${responseData.error}`); // Consider using a more user-friendly way to display errors
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
    }


  if (!bot.id) return <div>Cargando datos del bot...</div>;

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
          {/* Existing fields and labels for editing */}
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
          <div>Archivos Actuales:</div>
          {fileNames.map((fileName, index) => (
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
          <div>Archivos Actuales:
            {fileNames.map((fileName, index) => (
              <p key={index}>{fileName}</p>
            ))}
          </div>
        </>
      )}
      {/* Nuevos Archivos Section (always visible) */}
      <Button onClick={toggleEdit}>{isEditing ? 'Guardar' : 'Editar'}</Button>
      <div>Archivos Nuevos:</div>
      {newFiles.map((file, index) => (
        <div key={index}>
          {file.name} <FontAwesomeIcon icon={faTimes} onClick={() => handleRemoveNewFile(index)} />
        </div>
      ))}
      <button onClick={triggerFileInput}><FontAwesomeIcon icon={faPlus} /> Añadir archivo</button>
      <br></br>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple  
        style={{ display: 'none' }}
      />
      
    </div>
    {!isEditing && (
      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
        <Button onClick={sendBotData}>Enviar</Button>
      </div>
    )}
  </div>
</main>

  );

};

export default BotData;
