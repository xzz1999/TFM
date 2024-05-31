
import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai';
const fs = require('fs');
import { addBot } from '@/app/lib/actions';




  export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        try {
            const { assistantName, assistantModel, assistantDescription, files, assistantToken,ValidTopics, InvalidTopics } = await req.json();

            const openai = new OpenAI({
                apiKey: assistantToken,
              });
            const assistantOptions: any = {
                name: assistantName,
                instructions: assistantDescription,
                model: assistantModel,
                tools: [{ "type": "code_interpreter" }],
                file_ids: files
            };
        

            const assistant = await openai.beta.assistants.create(assistantOptions);
            const assistantId = assistant.id;
            const data ={
                Id: assistant.id,
                name: assistantName,
                ai: assistantModel,
                token: assistantToken,
                role:assistantDescription,
                fileId: files,
                ValidTopics: ValidTopics,
                InvalidTopics: InvalidTopics
            }
            const actualizar = await addBot(data);
            if(actualizar){
                console.log("se ha actualizado el fichero bot");
            }else{
                console.log(" no se ha actualizado el fichero bot");
            }

            return NextResponse.json({ 
                message: 'Assistant created successfully', 
                assistantId: assistantId 
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error);
                return NextResponse.json({ error: error.message });
            } else {
                console.error('Unknown error:', error);
                return NextResponse.json({ error: 'An unknown error occurred' });
            }
        }
    } else {
        return NextResponse.json({ error: 'Method Not Allowed' });
    }
};


