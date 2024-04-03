

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
  try {
 
    const data = await req.json();
    const threadId = data.threadId;
    const runId = data.runId;

    
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);



    return NextResponse.json({ status: runStatus.status });
  } catch (error) {
    console.error(`Error occurred: ${error}`);
  }
}