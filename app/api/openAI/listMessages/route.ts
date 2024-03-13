

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { botData } from '@/app/lib/actions';


// Define an asynchronous POST function to handle incoming requests
export async function POST(req: NextRequest) {
        //extraer la clave de cabecera
        const botId = req.headers.get('id');
        //debug
        console.log("id en listMessage:", botId);
        let bot;
        if(botId){
          bot = await botData(botId);
        }
        // debug
        console.log("bot:",bot);
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
    // Extract JSON data from the request
    const data = await req.json();

    // Retrieve 'threadId' from JSON data
    const threadId = data.threadId;
    //const runId = data.runId;
    //const run = await openai.beta.threads.runs.retrieve(
    //  threadId,
    //  runId
   // )
    //console.log("run:",run.status);
    //if(run.status=="completed"){
      
    const messages = await openai.beta.threads.messages.list(threadId);

    console.log(`Retrieved ${messages.data.length} messages`);
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


    
