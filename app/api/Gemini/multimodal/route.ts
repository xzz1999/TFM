import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import path from "path";
import { botData } from "@/app/lib/actions";



export async function POST(req:Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' });
  }
  const data = await req.json();
  console.log("data",data);

  

  try {
    // Access your API key as an environment variable.
    const bot = await botData(data.id);
    if (!bot) {
      throw new Error('Bot data not found');
    }
    const genAI = new GoogleGenerativeAI(bot.token);
    console.log("genAI",genAI)

    // Choose a model that's appropriate for your use case.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("model",model);

    const prompt = data.message || "Describeme la imagen";

    const imageParts = [{ inlineData: {
      data: data.base64Image.split(",")[1],"mimeType": "image/jpeg"
    }
    }];
    console.log("imageParts",imageParts)
    const startTime = Date.now();
    const result = await model.generateContent([prompt, ...imageParts]);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text, time:responseTime});
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ message: 'Internal Server Error' });
  }
}
