import { NextRequest, NextResponse } from 'next/server';
import { getBotId, botData, addUsers, addThread, getHilo,isRestricted,setConversation } from '@/app/lib/actions';
export async function POST(req: NextRequest) {
if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }
  try {
    const { token} = await req.json();
    const botId = await getBotId(token);
    const bot = await botData(botId);
    return NextResponse.json({
      status: "success",
      bot: bot?.ai,
      key: bot?.token,
      id: bot?.Id
    });
    } catch (e: any) { 
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en obtener ai de bot"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }}
    