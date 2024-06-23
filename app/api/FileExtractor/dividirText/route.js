import { NextRequest, NextResponse } from 'next/server';
const pdf = require('pdf-parse');

export async function POST(req ) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const text = await req.text();
    const paragraphs = text.split("\n");
    const chunks = [];
    const maxLength = 3000;
    let currentChunk = "";
    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length < 3000) {
          currentChunk += paragraph + "\n";
        } else {
          chunks.push(currentChunk);
          currentChunk = paragraph + "\n";
        }
      }
      if (currentChunk) {
        chunks.push(currentChunk);
      }
    return NextResponse.json({ 
      status: "success",
      messages: chunks
    });

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en dividir el texto en párrafos"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
