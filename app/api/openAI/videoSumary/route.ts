"use server";
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { text } = await req.json();
    const prompt = "dame este resumen de este texto\n"  + text;
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
      });
    const response_text =completion.choices[0].message.content;
    

    return new NextResponse(JSON.stringify({
        success: true,
        response: response_text
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      success: false,
      message: "Error generating chatbot response"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
