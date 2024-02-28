
  "use client";
  import { lusitana, roboto } from '@/app/ui/fonts';
  import IA from '@/app/ui/dashboard/api';
  import Token from '@/app/ui/dashboard/token';
  import Role from '@/app/ui/dashboard/role';
  import Name from '@/app/ui/dashboard/nombre' 
  import Files from '@/app/ui/dashboard/archivos';
  import React, { useState } from 'react'; 
  import { Button } from '@/app/ui/button'; 
  import {isDataNull} from '@/app/lib/actions'


  const  Page = () => {

    const [selectAI, setSelectAI] = useState("");
    const [token, setToken] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [files, setFiles] = useState([]);
    const handleOptionSelected  = (selectedOption) => {
      setSelectAI(selectedOption.value);
      //debug
      console.log('Opción seleccionada:', selectedOption); 
    };


    const handleTokenSubmit = (tokenValue) => {
      setToken(tokenValue);
      //debug
      console.log("Token recibido:", tokenValue);
    };
    
    const handleNameSubmit = (nameValue) =>{
      setName(nameValue);
      //DEBUG
      console.log("nombre de bot:",name);
    }

    const handleRoleSubmit = (nameRole) => {
      setRole (nameRole);
      // DEBUG
      console.log ("Role de bot:", role);
    }
    
    const handleFilesChange = (selectedFiles) => {
      // Actualiza el estado con los nuevos archivos seleccionados
    
      setFiles(selectedFiles);
    };

    const handleCreate = async () => {
      const dataToSend = {
        assistantName: name,
        assistantModel: selectAI,
        assistantDescription: role,
        assistantToken: token
      };
      const verifier = isDataNull(dataToSend);
      console.log("verifier:",verifier);
      if(verifier){
      try {
        // Sube cada archivo y recopila sus referencias (IDs, URLs, etc.)
        console.log("files:",files);
        const files_ids = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file); // Asegúrate de que 'file' coincida con lo que tu endpoint de subida espera
          const uploadResponse = await fetch('/api/uploadFile', {
            method: 'POST',
            headers: {
              'key' : token,
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
      files_ids.push(uploadResult.fileId);
    }
    dataToSend.files = files_ids;
    
    
      try {
        const response = await fetch('api/createAssistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // If you need to send a token or any other headers, add them here
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dataToSend),
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const responseData = await response.json();
        if (responseData.error) {
          console.error('Error creating assistant:', responseData.error);
          alert(`Error: ${responseData.error}`); // Consider using a more user-friendly way to display errors
        } else {
          console.log('Assistant created successfully:', responseData.assistantId);
          alert(`Assistant created successfully. ID: ${responseData.assistantId}`);
          setToken("");
          setRole("");
          setName("");
          setFiles([]);
          setSelectAI("");
        }
      }catch(error){
        console.error("Error en crear assistente:",error);
      } 
    }catch (error) {
        console.error('Error in handleCreate:', error);
        alert(`Error: ${error.message}`); // Consider using a more user-friendly way to display errors
      }
    }else{
      alert("Missing required assistant parameters");
    }
    }
  
    

    return (
      <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{  flex: 1, paddingRight: '20px' }}> 
          <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            Dashboard
          </h1>
          <br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Select AI API
          </h2>
          <IA onOptionSelected={handleOptionSelected} />
          {selectAI && <p>Opción seleccionada: {selectAI}</p>}
          <br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Introduce your IA token
          </h2>
          <Token onTokenSubmit={handleTokenSubmit} />
          {token && <p>Token: {token}</p>}
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Archivos
          </h2>
          <Files onFilesChange={handleFilesChange}/>
          </div>
          <div style={{ flex: 2, }}> 
          <br></br>
          <br></br>
          <br></br>
          <br></br><br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Name of the chatbot
          </h2>
          <Name onNameSubmit={handleNameSubmit}/>
          {name && <p> name: {name}</p>}
          <br></br>
          <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
            Instruction of the chatbot
          </h2>
          <Role onRoleSubmit={handleRoleSubmit}/>
          {role && <p> role: {role}</p>}
          <br></br>
          <br></br><br></br>
          <Button onClick={handleCreate} style={{ marginTop: '20px' }}>
            Crear
          </Button>


        </div>
      </main>
    );
  }

  export default Page;