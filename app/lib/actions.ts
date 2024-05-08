'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import {datafichero,dataBot,dataRequire,dataConversation, dataGetConversation, datallama} from '@/app/lib/definitions'
import {MongoClient} from 'mongodb';
const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);



export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
  
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'contraseña invalida.';
        default:
          return 'algo ha fallado.';
      }
    }
    throw error;
  }
}

//verifica si los archivos subidos non son duplicados
export async function checkFile  (hash : string) {
  try{
      await client.connect();
      const database = client.db("TFM");
      const collection = database.collection("Files");
      const result = await collection.findOne({'ficherohash': hash});
      await client.close();
      if(result){
        return result.ficheroId;
      }else{
        return null;
      }
  
}catch(error){
  console.log("error en checkear fichero:",error);
}}
// funcion para insertar un fichero en base de dato
export async function updateFile(fichero: datafichero){
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("Files");
    await collection.insertOne(fichero);
    await client.close();
    return true;
    
  }catch(error){
    console.log("error en actualizar fichero.json:", error);
    
  }
}

// funcion que devuelve el nombre de los ficheros de un bot
export async function filesName(ficheroID: string[]) {
  //debug
  console.log("filesname");
  try {
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("Files");
    const query = { ficheroId: { $in: ficheroID } };
    const files = await collection.find(query).toArray();
    const nombres = files.map(file => file.ficheroName);
    await client.close();
    return nombres;
  } catch (error) {
    console.log("error en buscar el nombre de fichero:", error);
  }
}
// funcion que devuelve el id de fichero bot;
export async function fileId(ficheroname: string) {
  //debug
  console.log("filesId");
  try {
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("Files");
    const file = await collection.findOne({"ficheroName":ficheroname});
    await client.close();
    if(file){
      return file.ficheroId;
    }else{
      return null
    }

  } catch (error) {
    console.log("error en buscar el nombre de fichero:", error);
  }
}
// funcion que elimina un fichero de fichero.json dado el ficheroid
export async function deleteFile (id:string){
  try{
    await client.connect();
    const database = client.db("TFM");
    const collectionFile = database.collection("Files");
    const collectionBot = database.collection("bots");
    const numeroBots = await collectionBot.countDocuments({ fileId: fileId });
    if(numeroBots > 1){
    await collectionFile.deleteOne({"ficheroId": id});
    return true;
    }else
    return false;
}catch(error){
  console.log("error en eliminar fichero:", error);
}
}

// Función para añadir un bot a la base de datos de MongoDB
export async function addBot(fichero: any) {
  try {
 
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const result = await collection.insertOne(fichero);
    await client.close();
    return true;
  } catch (error) {
    console.error("Error al escribir bot en MongodB:", error);
  }
}

//funcion que eliminar un bot de fichero
export async function deleteBot(id: string) {
  try {
 
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const query = { Id:id }
    await collection.deleteOne(query);
    return true;
  } catch (error) {
    console.error("Error al escribir bot en MongodB:", error);
  }finally{
    await client.close();
  }
}

//actualizar un bot
export async function updateBot(id:string, datos: dataBot){
  console.log("data:",datos);
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const result = await collection.updateOne(
      { "Id": id }, 
      { $set: datos } 
    );
    await client.close();
    if(result){
      return true;
    }else{
      return false;
    }
  }catch (error) {
    console.error('Error updating bot:', error);
  }

}

// verifica si los datos de bot no son nulos
export async function isDataNull  (data:dataRequire| datallama)  {
  console.log("data:", data);
  const isInvalid = Object.values(data).some(value => value === null || value === undefined || value === '');
  console.log("es válido:", isInvalid);
  if(!isInvalid) return true;
  else return false;
};

// funcion que devuelve la lista de bots existentes con su nombre y el id
export async function getBot () {
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const bots = await collection.find({}).toArray();
    await client.close();
    const botsSerializable = bots.map(bot => {
      return {
  
        Id: bot.Id,
        name: bot.name,
      };
    });
    return botsSerializable

}catch(error){
  console.log("error en obtener lista de bots:", error);
}}


// funcion que devuelve los datos de un bot identificado por su id
export async function botData (botId: string | null){
  

  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const bot = await collection.findOne({ "Id": botId });
    
    await client.close(); 
    if (!bot) {
      return null; }
      const botsSerializable = {
        Id: bot.Id, 
        name: bot.name,
        ai: bot.ai,
        token: bot.token,
        role: bot.role,
        fileId: bot.fileId
      };
      return botsSerializable;
  }catch(error){
    console.log("error en busqueda de bot:", error);
  }
  
}
// funcion que chekear si un correoelectronico es asociado a un bot y si no existe añade 
  export async function addUsers(id: string, correo: string) {
      console.log("chequeando si existe usuario");
    try {
      await client.connect();
      const database = client.db("TFM");
      const collection = database.collection("botUsers");
      const botExists = await collection.findOne({ "id": id, "correo": correo });
      if (botExists) {
        return false; 
      } else {
        const bot = await collection.findOne({ "id": id });
        if (bot) {
          await collection.updateOne({ "id": id }, { $push: { "correo": correo } });
          await client.close();
        } else {
          await collection.insertOne({ "id": id, "correo": [correo], "hilos": [] });
          await client.close();
        }
        return true;
      
      }  } catch (error) {
        console.error("Error en la buscar el bot asociado a usuario:", error);
      }
    }
      
  
      
      // function que añade el thread a usuario
  export async function addThread (thread: string, id:string){
   
    try {
      await client.connect();
      const database = client.db("TFM");
      const collection = database.collection("botUsers");
      await collection.updateOne({ "id": id }, { $push: { "hilos": thread } });
      return true;
  }catch(error){
    console.log("error en añadir hilo a usuario:", error);
  }
}

// buscar el hilo de usuario dado el botid y su correo
export async function getHilo (id: string, correo: string){
  try{
    await client.connect();
      const database = client.db("TFM");
      const collection = database.collection("botUsers");
      const usuario = await collection.findOne({ "id": id, "correo": correo });
      if (usuario) {
        const index = usuario.correo.indexOf(correo);
        await client.close();
        return usuario.hilos[index];
      }else{
        return null;
      }
  }catch(error){
    console.log("error en buscar el hilo:",error)

  }
}



// funcion para buscar en la base de datos la contraseña 
export async function getPassword(correo: string): Promise<string> {
  try {
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("users");

    const result = await collection.findOne({'email': correo});

    await client.close();


    if (result && result.password) {
      return result.password; 
    } else {
      return ""; 
    }
  } catch (error) {
    console.error("Error al obtener el password de MongoDB:", error);
    return ""; 
  }
}

// funcion que devulve el el posicion de array que se encuentra el usario

export async function getIndex (correo:string,botId:string){
  try{
  await client.connect();
  const database = client.db("TFM");
  const collection = database.collection("botUsers");
  const user = await collection.findOne({ id: botId });
  if(user) {
     const index = user.correo.indexOf(correo);
     return index;
  }else {
    console.log('usuario no encontrado');
}
  }catch(e){
    console.log("error en la busquedad de indice:", e);
  }finally {
    await client.close(); 
}
}


// funcion que devuleve el correo de usuario por su indice y botID
export async function getEmail (botId:string,index: number){

  try {
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("botUsers");
  
    const user = await collection.findOne({ id: botId });
    
    if (user) {
        
            return user.correo[index]; 
    
        } else {
        console.log("Usuario del bot no encontrado");
    }
} catch (error) {
    console.log("error en buscar el correo");
   
} finally {
    await client.close(); 
}
}


// funcion que añade las iteraciones de usuario con el bot al base de datos Mongo
export async function setConversation(conversation:dataConversation){
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("Conversations");
    await collection.insertOne(conversation);
    await client.close()

  }catch(e){
    console.log("error en insertar una query en mongodb:",e);
  }
}
// funcion que devuelve la lista entera de bots existentes
export async function getBotList(){
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("bots");
    const bots = await collection.find({}).toArray();
    await client.close()
    const botList = bots.map(bot => ({
      id: bot.Id,
      name: bot.name
    }));
    console.log("botList:",botList);
    return botList;

  }catch(e){
    console.log("error en obtener la lista de bot en mongodb:",e);
  }
}
// funcion que devuelve todas los usuarios asociados de un bot
export async function getUsersList(bot:string){
   
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("botUsers");
    const query = { id: bot };
    const options = {
      projection: { _id: 0, correo: 1 },
    };
    const users = await collection.find(query, options).toArray();
    
    const emailsAndIndices = users.flatMap((user, userIndex) =>
        user.correo.map((email:String, emailIndex:number) => ({
          email,
          index: emailIndex,

    }))
  );
    
    return emailsAndIndices;
  }catch(e){
    console.log("error en obtener la lista de bot en mongodb:",e);
  }finally{
    await client.close()
  }
}

// funcion que devuelve  las conversaciones
export async function getCoversation(data:dataGetConversation){
  try{
    await client.connect();
    const database = client.db("TFM");
    const collection = database.collection("Conversations");
    let query = {};
    console.log("getConversation user:", data.user);
    console.log("getConversation Time:", data.Time);
    console.log("getConversation bot:", data.bot);
    if (data.Time && data.user != 'Todo') {
      const startTime = new Date(data.Time);
      startTime.setUTCHours(0, 0, 0, 0);  
      console.log("startTime:",startTime);
      const endTime = new Date(data.Time);
      endTime.setUTCHours(23, 59, 59, 999);
      console.log("endTime:",endTime);
      query = { 
        bot: data.bot, 
        student : data.user,
        Time: { $gte: startTime, $lt: endTime }
      };
    } else if (data.Time && data.user == 'Todo') {
      const startTime = new Date(data.Time);
      startTime.setUTCHours(0, 0, 0, 0); 
      const endTime = new Date(data.Time);
      endTime.setUTCHours(23, 59, 59, 999);
      query = { 
        bot: data.bot, 
        Time: { $gte: startTime, $lt: endTime }
      };

      
    } else if (!data.Time && data.user != "Todo") {
      query = { bot: data.bot,student: data.user };
    }else if (!data.Time && data.user == "Todo"){
      query = { bot: data.bot };
    }
    const projection = { bot: 1, Time: 1, student: 1, question: 1, answer: 1 };
    const cursor = collection.find(query).project(projection);
    let conversations = await cursor.toArray();
    conversations = conversations.map(({ bot, Time, student, question, answer}) => ({
      bot,
      Time,
      student,
      question,
      answer
    }));
    return conversations;
  }catch(e){
    console.log("error en obtener la conversacion:",e);
  }finally{

    await client.close()
  }

}

