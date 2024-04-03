
const { GoogleGenerativeAI } = require("@google/generative-ai");
import { botData, getCoversation,getEmail } from "@/app/lib/actions";
import { NextRequest, NextResponse } from 'next/server';


  export async function POST(req: NextRequest) {
    const botId = req.headers.get('id');
    const indexStr = req.headers.get("user");
    const index = indexStr ? parseInt(indexStr, 10) : null;
   
    if (!botId ) {
      console.log('BotId no es proporcionado');
      return NextResponse.json({ success: false, message: "falta algun parámetro botId " });
    }
      
    if (index === null) {
            console.log('Usuario No Proporcionado');
      return NextResponse.json({ success: false, message: "falta el  parámetro usuario" });
     }
    const bot = await botData(botId);
    const usuario = await getEmail(botId,index);
    const dataConver ={
      bot: botId,
      user: usuario,
      Time: null
    }

    if (!bot) {
      console.log('bot no encontrado');
      return NextResponse.json({ success: false, message: 'bot no encontrado' });
    }
    const  conversation = await getCoversation(dataConver);
    const token = bot.token;
    const ai = bot.ai;
    const genAI = new GoogleGenerativeAI(token);
    const model = genAI.getGenerativeModel({ model: ai});
    

        if (req.method === 'POST') {
        try {
            const { question} = await req.json();
            if(conversation === undefined){
              console.log('bot no encontrado el historial de bot');
              return NextResponse.json({ success: false, message: 'hitorial no encontrado' });
            }
            
            let userParts: { text: any; }[] = [];
            let modelParts: { text: any; }[] = [];
          conversation.forEach((doc) => {
            userParts.push({ text: doc.question });
            modelParts.push({ text: doc.answer });
          });
          let history = [
            { role: "user", parts: userParts },
            { role: "model", parts: modelParts }
          ];
          console.log("history:", history);
          const chat = model.startChat({
            history: history
          });;
              const result = await chat.sendMessage(question);
              const response = await result.response;
              const text = response.text();
           

            return NextResponse.json({ 
                response: text
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error);
                return NextResponse.json({ error: error.message });
            } else {
                console.error('Unknown error:', error);
                return NextResponse.json({ error: 'An unknown error occurred' });
            }
        }
    } else {
        return NextResponse.json({ error: 'Method Not Allowed' });
    }
};