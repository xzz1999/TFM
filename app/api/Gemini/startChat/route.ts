
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { botData } from "@/app/lib/actions";
import { NextRequest, NextResponse } from 'next/server';


let chatSessions: { [sessionId: string]: any } = {};

  export  async function POST(req: NextRequest) {
    const botId = req.headers.get('id');
    if (!botId ) {
      console.log('BotId no es proporcionado');
      return NextResponse.json({ success: false, message: "falta algun parámetro botId " });
    }
    const bot = await botData(botId);
    if (!bot) {
      console.log('bot no encontrado');
      return NextResponse.json({ success: false, message: 'bot no encontrado' });
    }
    if (req.method === 'POST') {
      const data = await req.json();
      if (data && data.action === 'startChat') {
    const token = bot.token;
    const ai = bot.ai;
    const genAI = new GoogleGenerativeAI(token);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        try {
          const chat = model.startChat({
            history: [
              {
                role: "user",
                parts: [{ text: bot.role }],
              },
              {
                role: "model",
                parts: [{ text: "hola, en que te puedo ayudar?" }],
              },
            ]
          });
          const sessionId = Date.now().toString();
          chatSessions[sessionId] = chat;
            return NextResponse.json({ 
                id: sessionId
            });
        } catch (error) {
                console.log('Error:', error);

           
        }
      }else if (data && data.action === 'sendMessage') {
        try{
        const sessionId = data.id;
        const question = data.question;
        console.log("chat");
        const chat = chatSessions[sessionId];
        const startTime = Date.now()
        console.log("result");
        const result = await chat.sendMessage(question);
        const response = await result.response;
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const text = response.text();
            return NextResponse.json({ 
                response: text,
                time: responseTime
            });

      }catch(e){
        console.log("error en añadir mensaje:",e);
      }
      } else {
        return NextResponse.json({ error: 'Method Not Allowed' });
    }
  }
  
};
