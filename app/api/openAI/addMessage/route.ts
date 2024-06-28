

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { botData } from '@/app/lib/actions';

export async function POST(req: NextRequest) {

        
    const botId = req.headers.get('id');
    let bot;
    if(botId){
      bot = await botData(botId);
    }
   
    if (!bot) {
      console.log('API KEY No proporcionado');
      return NextResponse.json({ success: false, message: 'API key is required' });
    }
    const token = bot.token;
   
  
     
      const openai = new OpenAI({
        apiKey: token
      });
  try {
    
    const data = await req.json();
    const threadId = data.threadId;
    const input = data.input;
    console.log("input:", input)
    if (typeof input !== 'string') {
      throw new Error('Input is not a string');
    }
    if (input) {
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: input,
      });
     
      return NextResponse.json({ message: "Message created successfully" });
      }
   
    return NextResponse.json({ message: 'No action performed' });
  } catch (error) {
 
    if (error instanceof Error) {
      console.error('Error:', error);
      return NextResponse.json({ error: error.message });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ error: 'xvc' });
    }
  }
}