
import { NextResponse } from "next/server"
import OpenAI from "openai";


export async function POST(request: Request) {

    const data = await request.json();
    const token = data.token;
    const openai = new OpenAI({ apiKey:token});

    if (data?.image) {
        console.log(data)
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                        { type: "text", text: data.message},
                        {
                            type: "image_url",
                            image_url: {
                            "url": data.image,
                            },
                        },
                        ],
                    },
                ],
                max_tokens: 300
            });
    
            console.log(response.choices[0]);
            return NextResponse.json({ response: response.choices[0]}, { status: 200 })
        } catch (error) {
            return NextResponse.json({ error }, { status: 400 })
        }
        
    }
    
    return NextResponse.json({ message: 'Received' }, { status: 400 })
}