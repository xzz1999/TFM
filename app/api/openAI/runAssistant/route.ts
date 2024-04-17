/**
 * API Route - Run Assistant
 * 
 * This API route is crafted to facilitate interaction with the OpenAI API, specifically for running 
 * a session with an AI assistant. The route is responsible for receiving the assistant ID and thread ID, 
 * which are crucial for identifying the specific assistant and conversation thread to interact with. 
 * Upon receiving these IDs, the route invokes the OpenAI API to create a new run (interaction) within 
 * the specified thread and then returns the run ID for tracking and further operations.
 * 
 * Path: /api/runAssistant
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { botData } from '@/app/lib/actions';




export async function POST(req: NextRequest) {
  try {
    // Extracting the assistant ID and thread ID from the JSON payload of the request.
    // These IDs are essential for specifying which assistant and conversation thread
    // to interact with.
    const botId = req.headers.get('id');
    //debug
    console.log("id:", botId);
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
    console.log("token:",token);
  
      // Inicializar OpenAI
      const openai = new OpenAI({
        apiKey: token
      });
    const data = await req.json();
    const assistantId = data.assistantId;
    const threadId = data.threadId;
    
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    
    console.log(`run: ${JSON.stringify(run)}`);

    return NextResponse.json({ runId: run.id });
  } catch (error) {
    
    console.error(`Error in -runAssistant: ${error}`);
    return NextResponse.json({ error: 'Failed to run assistant' }, { status: 500 });
  }
}
