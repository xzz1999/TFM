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
    
    // Logging the received IDs for debugging purposes. This helps in verifying that
    // the correct IDs are being processed.
    console.log(`Inside -runAssistant --> assistantId: ${assistantId}`);
    console.log(`Inside -runAssistant --> threadId: ${threadId}`);

    // Creating a new run (interaction) using the OpenAI API with the provided assistant and thread IDs.
    // This step is crucial for initiating the interaction with the AI assistant.
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Logging the details of the created run for debugging. This includes the run ID and any other relevant information.
    console.log(`run: ${JSON.stringify(run)}`);

    // Responding with the run ID in JSON format. This ID can be used for further operations
    // such as retrieving the run's output or continuing the conversation.
    return NextResponse.json({ runId: run.id });
  } catch (error) {
    // Handling and logging any errors that occur during the process. This includes errors in
    // API requests, data extraction, or any other part of the interaction flow.
    console.error(`Error in -runAssistant: ${error}`);
    return NextResponse.json({ error: 'Failed to run assistant' }, { status: 500 });
  }
}
