const { GoogleGenerativeAI } = require("@google/generative-ai");
import { botData } from "@/app/lib/actions";
import { NextRequest, NextResponse } from 'next/server';

let chatSessions: { [sessionId: string]: any } = {};

export async function POST(req: NextRequest) {
    const botId = req.headers.get('id');
    if (!botId) {
        console.log('BotId not provided');
        return NextResponse.json({ success: false, message: "bot id no proporcionado" });
    }

    const bot = await botData(botId);
    if (!bot) {
        console.log('Bot not found');
        return NextResponse.json({ success: false, message: 'Bot no encontrado' });
    }

    if (req.method === 'POST') {
        const data = await req.json();
        if (!data || !data.action) {
            return NextResponse.json({ success: false, message: 'request invalido' });
        }

        switch (data.action) {
            case 'startChat':
                return await startChat(bot);
            case 'sendMessage':
                return await sendMessage(data);
            default:
                return NextResponse.json({ success: false, message: 'acción desconocido' });
        }
    } else {
        return NextResponse.json({ success: false, message: 'metodo no permitido' });
    }
}

async function startChat(bot: any) {
    const token = bot.token;
    const ai = bot.ai;
    const genAI = new GoogleGenerativeAI(token);
    const model = genAI.getGenerativeModel({ model: ai });

    try {
        const chat = await model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: bot.role }],
                },
                {
                    role: "model",
                    parts: [{ text: "Hola, ¿en qué te puedo ayudar?" }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 100,
            },
        });
        const sessionId = Date.now().toString();
        chatSessions[sessionId] = chat;
        return NextResponse.json({ id: sessionId });
    } catch (error) {
        console.log('Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to start chat' });
    }
}

async function sendMessage(data: any) {
    const sessionId = data.id;
    const question = data.question;

    if (!sessionId || !question) {
        return NextResponse.json({ success: false, message: 'parametro sessionId o question no encontrado' });
    }

    const chat = chatSessions[sessionId];
    if (!chat) {
        return NextResponse.json({ success: false, message: 'session de chat no encontrado' });
    }

    try {
        console.log("Question:", question);
        const startTime = Date.now();
        const result = await chat.sendMessage("hola")
        const response = await result.response;
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const text = await response.text();

        return NextResponse.json({ 
            response: text,
            time: responseTime
        });
    } catch (error) {
        console.log('Error en enviar el mensaje:', error);
        return NextResponse.json({ success: false, message: 'fallo en responder la pregunta' });
    }
}
