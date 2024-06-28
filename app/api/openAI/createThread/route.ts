

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
      console.log('No API key provided');
      return NextResponse.json({ success: false, message: 'API key is required' });
    }
    const token = bot.token;



    const openai = new OpenAI({
      apiKey: token
    });
  if (req.method === 'POST') {

    try {
      
  
      const thread = await openai.beta.threads.create();
      const threadId = thread.id;

      return NextResponse.json({ threadId });
    } catch (error) {
      console.error('Error:', error);
      return NextResponse.json({ error: (error as Error).message });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' });
  }
}