import { NextRequest, NextResponse } from 'next/server';
import { getBotId, botData, addUsers, addThread, getHilo,isRestricted,setConversation } from '@/app/lib/actions';
import axios from  'axios'
import { _iterSSEMessages } from 'openai/streaming.mjs';
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { text, token, user } = await req.json();
    console.log("Mensaje recibido:", text, token, user);
    const botId = await getBotId(token);
    const bot = await botData(botId);
    console.log("Bot:", bot?.ai);
    let responseText;
    switch (bot?.ai) {
      case 'gpt-3.5-turbo':
      case 'gpt-4-1106-preview':
        responseText = await processGPTMessage(text, botId, user);
        break;
      case 'gemini-1.0-pro':
        responseText = await processGeminiMessage(text, botId, user);
        break;
      case 'llama3':
        responseText = await processLlamaMessage(text, botId, user);
        break;
      case 'Mistral-7B':
        responseText = await processMistralMessage(text, botId, user);
        break;
      default:
        return new NextResponse(JSON.stringify({
          status: "error",
          message: "Unsupported bot AI type"
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    return NextResponse.json({
      status: "success",
      text: responseText
    });

  } catch (e: any) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en obtener la transcripción del video"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

async function processGPTMessage(message: string, botId: string, user: string) {
  const usuario =  await addUsers(botId, user); 
  if (usuario) {
    const hilo = await axios.post('http://localhost:3000/api/openAI/createThread', 
      { user: user }, 
      { headers: { 'id': botId } }
    );
    await addThread (hilo.data.threadId, botId);
  }
  const interaccion = {
    bot: botId,
    Time: new Date(),
    student: user,
    question: message,
    responseTime: 0,
    answer: ""
  }
  const hilo = await getHilo(botId, user);
  console.log("Hilo:", hilo)
  const startTime = Date.now();
  await axios.post('http://localhost:3000/api/openAI/addMessage', 
    { input: message,
      threadId: hilo
    }, 
    { headers: { 'id': botId } }
  );
  const response = await axios.post('http://localhost:3000/api/openAI/runAssistant', 
    { assistantId: botId,
      threadId: hilo
    }, 
    { headers: { 'id': botId } }
  );
  const runId = response.data.runId;
  let isCompleted = false;
  while (!isCompleted) {
    const check = await axios.post('http://localhost:3000/api/openAI/checkRunStatus', 
      { 
        threadId: hilo,
        runId: runId
      }, 
      { headers: { 'id': botId } }
    );

    if (check.data.status === "completed") {
      isCompleted = true;
    } else {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      }
    }
    const respuesta = await axios.post('http://localhost:3000/api/openAI/listMessages', 
      { 
        threadId: hilo
      }, 
      { headers: { 'id': botId } }
    );
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    interaccion.responseTime = responseTime;
    const res = respuesta.data.messages.text.value;
    const restricted = await isRestricted(botId);
    if(restricted){
      const bot  = await botData(botId);
      const validar = await axios.post('http://localhost:3000/api/Guardrail/sendMensaje', 
        { 
          message: res,
          topics: bot?.validTopics,
          invalidTopics: bot?.invalidTopics
        }, 
      );
    if(validar.data.status === "success"){
      interaccion.answer = res;
      return res;
    }else{
      interaccion.answer = "Lo siento, no puedo responderte acerca de este tema";
      return "Lo siento, no puedo responder a esa pregunta.";

    }
  }
  interaccion.answer = res;
  await setConversation(interaccion);
   return res;
  }
   



async function processGeminiMessage(message: string, botId: string, user: string) {
   await addUsers(botId, user);
  const interaccion = {
    bot: botId,
    Time: new Date(),
    student: user,
    question: message,
    responseTime: 0,
    answer: ""
  }
  const response =  await axios.post('http://localhost:3000/api/Gemini/startChat', 
    { action: 'startChat' },
    {
        headers: {
            'Content-Type': 'application/json',
            'id': botId
        }
    }
);
const id = response.data.id;
const res = await axios.post('http://localhost:3000/api/Gemini/startChat',
    {
        id: id,
        question: message,
        action: 'sendMessage'
    },
    {
        headers: {
            'Content-Type': 'application/json',
            'id': botId
        }
    });
  const respuesta = res.data.response;
  console.log("respuesta:",respuesta);
  const time = res.data.time;
  interaccion.responseTime = time;
  const restricted = await isRestricted(botId);
    if(restricted){
      const bot  = await botData(botId);
      const validar = await axios.post('http://localhost:3000/api/Guardrail/sendMensaje', 
        { 
          message: respuesta,
          topics: bot?.validTopics,
          invalidTopics: bot?.invalidTopics
        }, 
      );
    if(validar.data.status === "success"){
      interaccion.answer = respuesta;
      return res;
    }else{
      interaccion.answer = "Lo siento, no puedo responderte acerca de este tema";
      return "Lo siento, no puedo responder a esa pregunta.";

    }
  }
  interaccion.answer = respuesta;
  await setConversation(interaccion);
   return respuesta;
}

async function processLlamaMessage(message: string, botId: string, user: string) {
  try {
    await addUsers(botId, user);
    const bot = await botData(botId);
    const interaccion = {
      bot: botId,
      Time: new Date(),
      student: user,
      question: message,
      responseTime: 0,
      answer: ""
    }
    const startTime = Date.now();
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: botId,
      messages: [{ role: "user", content: message }],
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    interaccion.responseTime = responseTime;
    const res = response.data.message.content;
    const restricted = await isRestricted(botId);
    if(restricted){
      const bot  = await botData(botId);
      const validar = await axios.post('http://localhost:3000/api/Guardrail/sendMensaje', 
        { 
          message: res,
          topics: bot?.validTopics,
          invalidTopics: bot?.invalidTopics
        }, 
      );
    if(validar.data.status === "success"){
      interaccion.answer = res;
      return res;
    }else{
      interaccion.answer = "Lo siento, no puedo responderte acerca de este tema";
      return "Lo siento, no puedo responder a esa pregunta.";

    }
  }
  interaccion.answer = res;
  await setConversation(interaccion);
   return res;
}catch (e) {
  console.error("Error in processing the request:", e);
  return new NextResponse(JSON.stringify({
    status: "error",
    message: "Error en procesar la respuesta"
}));
}
}

async function processMistralMessage(message: string, botId: string, user: string) {
  await addUsers(botId, user);
  const interaccion = {
    bot: botId,
    Time: new Date(),
    student: user,
    question: message,
    responseTime: 0,
    answer: ""
  }
  const dataToSend = {
    message: message,
    botId: botId
  }
  const respuesta = await axios.post('http://localhost:3000/api/Mistral/sendMessage', dataToSend, {
    headers: {
        'Content-Type': 'application/json',
    }
})
  const responseTime = respuesta.data.time;
  const res = respuesta.data.data;
  interaccion.responseTime = responseTime;
  if (respuesta.data){
    const responseTime = respuesta.data.time;
    const res = respuesta.data.data;
    interaccion.responseTime = responseTime;
    const restricted = await isRestricted(botId);
    if(restricted){
      const bot  = await botData(botId);
      const validar = await axios.post('http://localhost:3000/api/Guardrail/sendMensaje', 
        { 
          message: res,
          topics: bot?.validTopics,
          invalidTopics: bot?.invalidTopics
        }, 
      );
    if(validar.data.status === "success"){
      interaccion.answer = res;
      return res;
    }else{
      interaccion.answer = "Lo siento, no puedo responderte acerca de este tema";
      return "Lo siento, no puedo responder a esa pregunta.";

    }
  }
  interaccion.answer = res;
  await setConversation(interaccion);
   return res;
  }
}




