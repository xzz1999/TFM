"use server";
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { botData } from '@/app/lib/actions';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { botId, message } = await req.json();
    const bot = await botData(botId);
    const role = bot?.role;
    const startTime = Date.now();


    const response = await fetch('http://138.4.22.130:9090/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": "aaaaaaaaaaaa",
      },
      body: JSON.stringify({
        model: "mistral7b",
        messages: [
          { "role": "assistant", "content": role },
          { "role": "user", "content": message }
        ],
      })
    });

    const data = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (data.choices && data.choices.length > 0) {
      const respuesta = data.choices[0].message;
      const assistantIndex = respuesta.content.indexOf("assistant");
      
      if (assistantIndex !== -1) {
        const mensajeParcial = respuesta.content.slice(0, assistantIndex);
        return new NextResponse(JSON.stringify({
          success: true,
          data: mensajeParcial,
          time: responseTime
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } else {
        return new NextResponse(JSON.stringify({
          success: true,
          data: respuesta.content,
          time: responseTime
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    } else {
      console.log("No se encontró ningún mensaje en las opciones devueltas.");
    }

    return new NextResponse(JSON.stringify({
      success: false,
      message: "No se encontró ningún mensaje en las opciones devueltas."
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    
  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      success: false,
      message: "Error en generar la respuesta de chatbot"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
