
  "use client";
  import { lusitana, roboto } from '@/app/components/fonts';
  import IA from '@/app/components/dashboard/api';
  import Token from '@/app/components/dashboard/token';
  import Role from '@/app/components/dashboard/role';
  import Name from '@/app/components/dashboard/nombre' 
  import Files from '@/app/components/dashboard/archivos';
  import React, { useState } from 'react'; 
  import { Button } from '@/app/components/button'; 
  import {isDataNull} from '@/app/lib/actions'  
  import {addBot} from '@/app/lib/actions';
  import { v4 as uuidv4 } from 'uuid';

  const  Page = () => {

    const [selectAI, setSelectAI] = useState("");
    const [token, setToken] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [files, setFiles] = useState([]);
    const [apiSelected, setApiSelected] = useState(false);
    const handleOptionSelected  = (selectedOption) => {
      setSelectAI(selectedOption.value);
      setApiSelected(true);
    };


    const handleTokenSubmit = (tokenValue) => {
      setToken(tokenValue);

    };
    
    const handleNameSubmit = (nameValue) =>{
      setName(nameValue);

    }

    const handleRoleSubmit = (nameRole) => {
      setRole (nameRole);
   
    }
    
    const handleFilesChange = (selectedFiles) => {
 
    
      setFiles(selectedFiles);
    };
    const generateId = () => {
      return uuidv4(); 
    };

    const handleCreate = async () => {
      const dataToSend = {
        assistantName: name,
        assistantModel: selectAI,
        assistantDescription: role,
        assistantToken: token
      };
      const verifier = await isDataNull(dataToSend);
      if(verifier){
        
        if(selectAI === "Gemini 1.0 Pro"){
          const id = generateId();
          try{
            const data ={
              Id: id,
              name: name,
              ai: selectAI,
              token: token,
              role: role,
              fileId: files
            }
            const add = await addBot(data);
            if(add){
              alert("Asistente creado exitosamente.");
              
            }
          }catch(error){
            alert(`Error: ${error.message}`); 
          }
        }
        else if(selectAI === "gpt-3.5-turbo" || selectAI === "gpt-4-1106-preview"){
          try {
            console.log("files:", files);
            const files_ids = [];
            for (const file of files) {
              const formData = new FormData();
              formData.append('file', file);
              const uploadResponse = await fetch('/api/openAI/uploadFile', {
                method: 'POST',
                headers: {
                  'key' : token,
                },
                body: formData,
              });
    
              if (!uploadResponse.ok) {
                throw new Error('Network response was not ok during file upload');
              }
    
              const uploadResult = await uploadResponse.json();
              console.log("uploadResponse:", uploadResponse);
              console.log("uploadresult:", uploadResult.fileId);
              if (uploadResult.error) {
                console.error('Error uploading file:', uploadResult.error);
              }
              console.log("uploadResult:", uploadResult);
    
              files_ids.push(uploadResult.fileId);
            }
            dataToSend.files = files_ids;
    
            try {
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
                console.error('Error creating assistant:', responseData.error);
                alert(`Error: ${responseData.error}`);
              } else {
                console.log('Assistant created successfully:', responseData.assistantId);
                alert(`Assistant created successfully. ID: ${responseData.assistantId}`);
              }
            }catch(error){
              console.error("Error en crear asistente:", error);
            } 
          }catch (error) {
            console.error('Error in handleCreate:', error);
            alert(`Error: ${error.message}`); 
          }
        }
        else {
          alert("Modelo de IA no soportado o desconocido.");
        }
      }else{
        alert("Missing required assistant parameters");
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
  
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Introduce your IA token
          </h2>
          <Token onTokenSubmit={handleTokenSubmit} />
          {token && <p>Token: {token}</p>}
  
          {(selectAI === "gpt-3.5-turbo" || selectAI==="gpt-4-1106-preview" ) && (
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
            {name && <p> name: {name}</p>}
            <br></br>
            <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
              Instruction of the chatbot
            </h2>
            <Role onRoleSubmit={handleRoleSubmit} />
            {role && <p> role: {role}</p>}
            <br></br>
            <Button onClick={handleCreate} style={{ marginTop: '20px' }}>
              Crear
            </Button>
          </div>
        )}
      </main>
    );
  }
  
  
  
  export default Page;