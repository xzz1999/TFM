'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import fs from 'fs';
import path from 'path';
import {datafichero,dataBot,dataRequire, dataMessage} from '@/app/lib/definitions'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    console.log("formData:",formData);
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

//verifica si los archivos subidos non son duplicados
export async function checkFile  (hash : string) {
  try{
  const filePath = path.join(process.cwd(),'ficheros.json');
  const jsonData = fs.readFileSync(filePath).toString();
  const obj = JSON.parse(jsonData);
  const hashExist = obj.find((obj: { ficherohash: string; })=>obj.ficherohash === hash);
  if(hashExist){
    return hashExist.ficheroId;
  }else return null;
}catch(error){
  console.log("error en checkear hash:",error);
}}
// funcion para actualizar el archivo fichero.json
export async function updateJson(fichero: datafichero){
  try{
    const filePath = path.join(process.cwd(),'ficheros.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    arrayData.push(fichero);
    const updatedJsonData = JSON.stringify(arrayData, null, 2);
    fs.writeFileSync(filePath, updatedJsonData);
    return true;
    
  }catch(error){
    console.log("error en actualizar fichero.json:", error);
    
  }
}

// funcion que devuelve el nombre de los ficheros de un bot
export async function filesName(ficheroID: string[]) {
  try {
    // Asegúrate de que la ruta a 'ficheros.json' es correcta en tu estructura de directorios
    const filePath = path.join(process.cwd(), 'ficheros.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);


    const nombres = ficheroID.map(id => {
      // Cambio 'file.name' a 'file.ficheroName' para que coincida con tu JSON
      const file = arrayData.find((fichero: { ficheroId: string }) => fichero.ficheroId === id);
      return file ? file.ficheroName : null; // Cambiado de 'file.name' a 'file.ficheroName'
    });
    return nombres;
  } catch (error) {
    console.log("error en buscar el nombre de fichero:", error);
    throw error; // Es buena práctica propagar el error para manejarlo en el llamador si es necesario.
  }
}
// funcion que devuelve el id de fichero bot;
export async function fileId(ficheroname: string) {
  try {
    // Asegúrate de que la ruta a 'ficheros.json' es correcta en tu estructura de directorios
    const filePath = path.join(process.cwd(), 'ficheros.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    console.log("arrayData:", arrayData);

    const id = arrayData.find((fichero: { ficheroName: string; }) => fichero.ficheroName === ficheroname);

    return id;
  } catch (error) {
    console.log("error en buscar el nombre de fichero:", error);
    throw error;
  }
}
// funcion que elimina un fichero de fichero.json dado el ficheroid
export async function deleteFile (id:string){
  try{
  const filePath = path.join(process.cwd(), 'ficheros.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    console.log("arrayData:", arrayData);
     // Encuentra el índice del fichero con el ID dado en el arreglo
  const index = arrayData.findIndex((fichero: { ficheroId: string; }) => fichero.ficheroId === id);
  // Si se encuentra el fichero, elimínalo del arreglo
  if (index !== -1) {
    arrayData.splice(index, 1); // Elimina el elemento en el índice encontrado
    fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2)); // Escribe el arreglo modificado de nuevo al archivo JSON
    console.log(`fichero con id: ${id} ha sido eliminado.`);
    return true;
  } else {
    console.log(`fichero con id: ${id} no encontrado.`);
    return false;
  }
}catch(error){
  console.log("error en eliminar fichero:", error);
}
}


// añadir un bot el fichero json de los bots 
export async function addBot(fichero: dataBot){
  try{
    const filePath = path.join(process.cwd(),'bots.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    arrayData.push(fichero);
    const addJsonData = JSON.stringify(arrayData, null, 2);
    fs.writeFileSync(filePath, addJsonData);
    return true;
    
  }catch(error){
    console.log("error en actualizar fichero.json:", error);
  }
}
//actualizar un bot
export async function updateBot(id:string, datos: dataBot){
  try{
    const filePath = path.join(process.cwd(),'bots.json');
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    const botIndex = arrayData.findIndex((bot: { Id: string; }) => bot.Id === id);
    if (botIndex === -1) {
      throw new Error('Bot no encontrado');
    }
    arrayData[botIndex] = { ...arrayData[botIndex], ...datos };
    fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));
    console.log('Bot actualizado');
    return true;

  }catch (error) {
    console.error('Error updating bot:', error);
  }
}


// verifica si los datos de bot no son nulos
export const isDataNull = (data:dataRequire) => {
  const isInvalid = Object.values(data).some(value => value === null || value === undefined || value === '');
  console.log("es válido:", isInvalid);
  if(!isInvalid) return true;
  else return false;
};
// funcion que devuelve la lista de bots existentes con su nombre y el id

export async function getBot () {
  try{
  const filePath = path.join(process.cwd(),'bots.json');
  console.log("filePath:",filePath)
    let jsonData = fs.readFileSync(filePath).toString();
    let arrayData = JSON.parse(jsonData);
    //const botNames = arrayData.map(((arrayData: { name:String  }) => arrayData.name));
    const bots = arrayData.map((bot: { name: String; Id: String; }) => ({
      name: bot.name,
      Id: bot.Id 
    }));
    //debug
    console.log("botNames:", bots);
    return bots;
}catch(error){
  console.log("error en obtener lista de bots:", error);
}}


// funcion que devuelve los datos de un bot identificado por su id
export async function botData (botId: string){
  try{
 
  const filePath = path.join(process.cwd(),'bots.json');
 
  let jsonData = fs.readFileSync(filePath).toString();

  let arrayData = JSON.parse(jsonData);
 
  const bot = arrayData.find((bot: { Id: string; }) =>bot.Id === botId);
   
  return bot ? bot : { error:"No se ha encontrado el bot con id:" + botId};
  }catch(error){
    console.log("error en busqueda de bot:", error);
  }
  
}
// funcion que chekear si un correoelectronico es asociado a un bot y si no existe añade y crear un hilo de ese usuario
export async function addUsers (id: string,correo:string){
  //debug
  console.log("id:",id);
  console.log("correo:",correo);
  try{
  const filePath = path.join(process.cwd(),'botUser.json');
  let jsonData = fs.readFileSync(filePath).toString();
  let arrayData = JSON.parse(jsonData);
  //debug
  console.log("arrayData:",arrayData);
  const botIndex = arrayData.findIndex((bot: { id: string; }) => bot.id === id);
  if (botIndex !== -1) {
    // Si el bot existe, verificar si el correo ya está asociado con ese bot
    if (arrayData[botIndex].correo.includes(correo)) {
      //debug
      console.log("El correo electrónico ya está asociado a este bot.");
      return false;
    } else {
      // Si el correo no está asociado, añadirlo a la lista de correos del bot, y crea un hilo para el usuario
      arrayData[botIndex].correo.push(correo);
      try{
        const result = await createChatThread(id);
        arrayData[botIndex].hilo.push(result.threadId)
        }catch(error){
          console.log("error en añadir un hilo a user:", error);
        }
      // Guardar los cambios en el archivo
      fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));

      console.log("Correo electrónico añadido con éxito al bot.");
      return true;
    }
  } else {
  
  
    try{
      const result = await createChatThread(id);
      arrayData.push({ id: id, correo: [correo], hilo:[result.threadId] });
      console.log("result:",result);
      }catch(error){
        console.log("error en añadir un hilo a user:", error);
      }

    // Guardar los cambios en el archivo

    fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));
    return true;
  }
}catch(error){
  console.log("error en encontrar el añadir el usuario:", error);
}


}

// funcion utilizado para llamar a api de crear hilo
export async function createChatThread(botId: string) {
  const bot = await botData(botId);
  //debug 
  console.log("bot:",bot.token);
  // debug
  console.log("creando hilo");

  try {
    const response = await fetch('http://localhost:3000/api/createThread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': bot.token,
      },
    });
   
    
    if (!response.ok) {
      throw new Error(`Network response was not ok, status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // Contiene el threadId o un mensaje de error
  } catch (error) {
    console.error("Error creating chat thread:", error);
    return { error: error };
  }
}
      
// funcion para llamar a api de addMensage y añade un mensaje a hilo
export async function addMessage(mensaje: dataMessage,id: string) {
  const bot = await botData(id);
  // Define el endpoint del API
  try {
    // Realiza la solicitud al API
    const response = await fetch('http://localhost:3000/api/addMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': bot.id,
      },
      body: JSON.stringify(mensaje),
    });

    // Espera la respuesta del API
    const result = await response.json();

    // Manejo de la respuesta
    if (response.ok) {
      console.log('Mensaje añadido exitosamente:', result);
    } else {
      console.error('Error al añadir el mensaje:', result.error);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
}


// buscar el hilo de usuario dado el botid y su correo
export async function getHilo (id: string, correo: string){
  const filePath = path.join(process.cwd(),'botUser.json');
  let jsonData = fs.readFileSync(filePath).toString();
  let arrayData = JSON.parse(jsonData);
  // Encuentra el bot que coincide con el ID proporcionado
  const bot = arrayData.find((bot: { id: string; }) => bot.id === id);
  if (bot) {
    // Verifica si el correo proporcionado está en la lista de correos del bot encontrado
    const correoExiste = bot.correo.includes(correo);
    if (correoExiste) {
      // Si el correo existe, devuelve el hilo asociado
      return bot.hilo;
    }
  }
  
  // Si no se encuentra el bot o el correo no coincide, devuelve un valor que indique el error o nulo
  return null;
}


