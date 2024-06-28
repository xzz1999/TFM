"use server";
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';


export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { modelId, message } = await req.json();
    const startTime = Date.now();
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ "role": "user", "content": message }],
        stream: false
      })
    });
    const data = await response.json();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return new NextResponse(JSON.stringify({
      success: 'true',
      data: data.message.content,
      time: responseTime
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      success: 'false',
      message: "error en generar la respuesta de chatbot"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}