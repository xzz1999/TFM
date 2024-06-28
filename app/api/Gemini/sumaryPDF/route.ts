import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { botData } from "@/app/lib/actions";


export async function POST(req:Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' });
  }
  const data = await req.json();

  try {
 
    //const bot = await botData(data.id);
    //if (!bot) {
     // throw new Error('Bot data not found');
    //}
    const apiKey = process.env.Gemini_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not defined');
    }
    const genAI = new GoogleGenerativeAI(apiKey);


    // Choose a model that's appropriate for your use case.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = "resumen me este texto \n\n" + data.text;

    const result = await model.generateContent(prompt);

    return NextResponse.json({ message: result.response.text(), status:"sucess"});
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ message: 'Internal Server Error' });
  }
}
