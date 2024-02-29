"use server";
/**
 * API Route - Create Chat Thread
 *
 * This API route facilitates the creation of a new chat thread using the OpenAI API.
 * It processes POST requests that contain an initial input message. This route is primarily
 * used to start a new conversation thread, initializing it with a user-specified message.
 * The newly created thread ID is then returned, enabling further interaction within that thread.
 *
 * Path: /api/createThread
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { botData } from '@/app/lib/actions';

export async function POST(req: NextRequest) {
  console.log('CREATE THREAD started');
  
    //extraer la clave de cabecera
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


    const openai = new OpenAI({
      apiKey: token
    });
  if (req.method === 'POST') {

    try {
      
  
      const thread = await openai.beta.threads.create();
      const threadId = thread.id;
      console.log('Thread ID:', threadId);

      return NextResponse.json({ threadId });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: (error as Error).message });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' });
  }
}