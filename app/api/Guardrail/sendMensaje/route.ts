"use server";
import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';


export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { topics,invalidTopics, message } = await req.json();
    const response = await fetch('http://127.0.0.1:5000/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message,
        valid_topics:topics,
        invalid_topics: invalidTopics

      })
    });
    const data = await response.json();
    if(data.message ==="Validation passed."){
    return new NextResponse(JSON.stringify({
      status: 'sucess',
      data: "mensaje válido"
    }));
  }else{
    return new NextResponse(JSON.stringify({
      status: 'false',
      data: "mensaje no válido"
    })); }

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      success: 'false',
      message: "error en validar el mensaje"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
