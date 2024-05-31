"use client";
import { lusitana, roboto } from '@/app/components/fonts';
import IA from '@/app/components/dashboard/api';
import Token from '@/app/components/dashboard/token';
import Role from '@/app/components/dashboard/role';
import Name from '@/app/components/dashboard/nombre';
import Files from '@/app/components/dashboard/archivos';
import Topics from '@/app/components/dashboard/topic'
import React, { useState } from 'react';
import { Button } from '@/app/components/button';
import { isDataNull } from '@/app/lib/actions';
import { addBot } from '@/app/lib/actions';
import { v4 as uuidv4 } from 'uuid';

const Page = () => {
  const [selectAI, setSelectAI] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [files, setFiles] = useState([]);
  const [apiSelected, setApiSelected] = useState(false);
  const [validTopics, setValidTopics] = useState([]);
  const [invalidTopics, setInvalidTopics] = useState([]);

  const handleConfirmTopics = (valid, invalid) => {
    setValidTopics(valid);
    setInvalidTopics(invalid);
    console.log(valid)
  };


  const handleOptionSelected = (selectedOption) => {
    setSelectAI(selectedOption.value);
    setApiSelected(true);
  };

  const handleTokenSubmit = (tokenValue) => {
    if(selectAI != ""){
    setToken(tokenValue);
    }else(
      alert("Selecciona primero el api de IA")
    )
  };

  const handleNameSubmit = (nameValue) => {
    setName(nameValue);
  }

  const handleRoleSubmit = (roleValue) => {
    setRole(roleValue);
  }

  const handleFilesChange = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  const generateId = () => {
    return uuidv4();
  };

  const handleCreate = async () => {
    switch(selectAI){
      case "llama3":
      case "Mistral-7B":
      const dataToSendllama = {
      assistantName: name,
      assistantModel: selectAI,
      assistantDescription: role,
    };
    const verifierllama = await isDataNull(dataToSendllama);
    if (!verifierllama) {
      alert("algun parámetro de bot esta vacia");
      return;
    }
    break;
    case  "gpt-3.5-turbo":
    case "gpt-4-1106-preview":
    case "gemini-1.0-pro":
      const dataToSend = {
        assistantName: name,
        assistantModel: selectAI,
        assistantDescription: role,
        assistantToken: token
      };
      const verifier = await isDataNull(dataToSend);
      if (!verifier) {
        alert("algun parámetro de bot esta vacia");
        return;
      }
  }

    switch (selectAI) {
      case "gemini-1.0-pro":
        const gid = generateId();
        try {
          const data = {
            Id: gid,
            name: name,
            ai: selectAI,
            token: token,
            role: role,
            file: files,
            validTopics: validTopics,
            invalidTopics: invalidTopics
          };
          const add = await addBot(data);
          if (add) {
            alert("Asistente creado exitosamente.");
            window.location.reload();
          }
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
        break;
      case "llama3":
        const lid = generateId();
        try {
          const data = {
            modelId: lid,
            modelName: name,
            modelAI: selectAI,
            modelDescription: role,
            file: files,
            ValidTopics: validTopics,
            InvalidTopics: invalidTopics
          };
          try{
          const response = await fetch('/api/llama/createModel', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          console.log("response:", response.status);
          if (response.status != '200'){
            throw new Error('Network response was not ok ');
            }
          
          const result = response.json;
          if (response.error) {
            alert(`Error: ${response.error}`);
          }else{
            alert("Asistente creado exitosamente.");
            window.location.reload();
          }
        }catch(e){
          console.log("error en crear bot llama:",e);
        }
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
        break;


      case "gpt-3.5-turbo":
      case "gpt-4-1106-preview":
        try {

          const dataToSend = {
            assistantName: name,
            assistantModel: selectAI,
            assistantToken:token,
            assistantDescription: role,
            ValidTopics: validTopics,
            InvalidTopics: invalidTopics
          };
          for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            const uploadResponse = await fetch('/api/openAI/uploadFile', {
              method: 'POST',
              headers: {
                'key': token,
              },
              body: formData,
            });

            if (!uploadResponse.ok) {
              throw new Error('Network response was not ok during file upload');
            }

            const uploadResult = await uploadResponse.json();
            const files_ids = [];
            if (uploadResult.error) {
              console.error('Error uploading file:', uploadResult.error);
              continue;
            }

            files_ids.push(uploadResult.fileId);
            dataToSend.files = files_ids;
          }
    

          const response = await fetch('/api/openAI/createAssistant', {
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
            alert(`Error: ${responseData.error}`);
          } else {
            alert(`Assistant created successfully. ID: ${responseData.assistantId}`);
            window.location.reload();
          }
        } catch (error) {
          alert(`Error: ${error.message}`);
        }
        break;
      case "Mistral-7B":
        try{
          const id = generateId();
          const data = {
            Id: id,
            name: name,
            ai: selectAI,
            role: role,
            fileId: files,
            validTopics: validTopics,
            invalidTopics: invalidTopics
            
          };
           const add = await addBot(data);
          if (add) {
            alert("Asistente creado exitosamente.");
            window.location.reload();
          }
        }catch(e){
          console.log("Error en añadir el bot mistral:", e)
        }
        break;
      default:
        alert("Modelo de IA no soportado o desconocido.");
        break;
    }
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
          Dashboard
        </h1>
        <br></br>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Select AI API
        </h2>
        <IA onOptionSelected={handleOptionSelected} />
        {selectAI && <p>Opción seleccionada: {selectAI}</p>}
        {(selectAI != "llama3" && selectAI != "Mistral-7B") && (
        <>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Introduce your IA token
        </h2>
        <Token onTokenSubmit={handleTokenSubmit} />
        {token && <p>Token: {token}</p>}
        </>
        )}

        {(selectAI === "gpt-3.5-turbo" || selectAI === "gpt-4-1106-preview") && (
          <>
            <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
              Archivos
            </h2>
            <Files onFilesChange={handleFilesChange} />
          </>
        )}
      </div>
      {apiSelected && (
        <div style={{ flex: 2 }}>
          <br></br><br></br><br></br><br></br><br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Name of the chatbot
          </h2>
          <Name onNameSubmit={handleNameSubmit} />
          {name && <p>name: {name}</p>}
          <br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Instruction of the chatbot
          </h2>
          <Role onRoleSubmit={handleRoleSubmit} />
          {role && <p>role: {role}</p>}
          <br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Topic
          </h2>
          <Topics onConfirm={handleConfirmTopics}/>
          <Button onClick={handleCreate} style={{ marginTop: '20px' }}>
            Crear
          </Button>
        </div>
        
      )}
    </main>
  );
}

export default Page;
