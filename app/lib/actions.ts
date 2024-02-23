'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import fs from 'fs';
import path from 'path';
import {datafichero,dataBot,dataRequire} from '@/app/lib/definitions';

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

// actualizar el fichero json de los bots 
export async function updateBot(fichero: dataBot){
  try{
    const filePath = path.join(process.cwd(),'bots.json');
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