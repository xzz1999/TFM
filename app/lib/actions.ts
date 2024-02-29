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
export async function botData (botId: string | null){
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
// funcion que chekear si un correoelectronico es asociado a un bot y si no existe añade 
  export async function addUsers(id: string, correo: string) {
      console.log("chequeando si existe usuario");
    try {
      const filePath = path.join(process.cwd(), 'botUser.json');
      let jsonData = fs.readFileSync(filePath).toString();
      let arrayData = JSON.parse(jsonData);
      
  
      const botIndex = arrayData.findIndex((bot: { id: string; }) => bot.id === id);
  
      if (botIndex !== -1) {
        // Si el bot existe, verificar si el correo ya está asociado con ese bot
        if (!arrayData[botIndex].correo.includes(correo)) {
          // Si el correo no está asociado, intentar crear un hilo y añadir el correo a la lista
            arrayData[botIndex].correo.push(correo);
            fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));
            console.log("Correo electrónico y hilo añadidos con éxito al bot existente.");
            return true;
          } else {
          console.log("El correo electrónico ya está asociado a este bot.");
          return false;
        }
      } else {
        // Si el bot no existe, intentar crear un hilo y añadir un nuevo bot
  
          arrayData.push({ id: id, correo: [correo], hilos: [] });
          fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));
          return true;
       
        
        }
      }catch(error){
      console.log("error en añadir el usuario:", error);}
      }
  
      // function que añade el thread a usuario
  export async function addThread (thread: string, id:string){
    console.log("añadiendo hilo a usuario");
    console.log("thread:", thread);
    console.log("id:", id);
    try {
      const filePath = path.join(process.cwd(), 'botUser.json');
      let jsonData = fs.readFileSync(filePath).toString();
      let arrayData = JSON.parse(jsonData);
      const botIndex = arrayData.findIndex((bot: { id: string; }) => bot.id === id);
      //debug
      console.log("botIndex:", botIndex);
      arrayData[botIndex].hilos.push(thread);
      console.log("arrayData:", arrayData);
      fs.writeFileSync(filePath, JSON.stringify(arrayData, null, 2));

  }catch(error){
    console.log("error en añadir hilo a usuario:", error);
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
      console.log("hilo obtenido:", bot.hilo);
      return bot.hilo;
    }
  }
  
  // Si no se encuentra el bot o el correo no coincide, devuelve un valor que indique el error o nulo
  return null;
}


