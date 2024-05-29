

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { botData } from '@/app/lib/actions';


export async function POST(req: NextRequest) {
        //extraer la clave de cabecera
        const botId = req.headers.get('id');

        let bot;
        if(botId){
          bot = await botData(botId);
        }
       
        if (!bot) {
          console.log('No API key provided');
          return NextResponse.json({ success: false, message: 'API key is required' });
        }
        const token = bot.token;
       
      
          // Inicializar OpenAI
          const openai = new OpenAI({
            apiKey: token
          });
  try {

    const data = await req.json();

    const threadId = data.threadId;
   
      
    const messages = await openai.beta.threads.messages.list(threadId);


    if(messages){
      return NextResponse.json({ messages: messages.data[0].content[0] });
    }else{
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
    //}

  }catch(e){
    console.error("error en fetch mensajes", e);
  }
}


    
