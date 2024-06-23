import { NextRequest, NextResponse } from 'next/server';
const pdf = require('pdf-parse');
import dotenv from 'dotenv';

dotenv.config();
export async function POST(req: NextRequest) {
  console.log("req", req);
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { data } = await req.json();
    console.log(data);
    const file: File | null = data.get('file') as unknown as File;
    if (!file) {
      console.log('No file found in the request');
      return NextResponse.json({ success: false });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = await pdf(buffer);
    console.log("text", text.text);
    return NextResponse.json({
      status: "success",
      message: text.text
    });

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en convertir el pdf en texto"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
