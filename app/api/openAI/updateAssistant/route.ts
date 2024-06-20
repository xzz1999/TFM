
/**
 * API Route - Update Assistant
 *
 * This route handles the creation of a new OpenAI assistant. It accepts POST requests
 * with necessary data such as assistant name, model, description, and an optional file ID.
 * This data is used to configure and create an assistant via the OpenAI API. The route
 * returns the ID of the newly created assistant, allowing for further operations involving
 * this assistant. It's designed to provide a seamless process for setting up customized
 * OpenAI assistants as per user requirements.
 *
 * Path: /api/createAssistant
 */
import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai';
const fs = require('fs');
import { updateBot } from '@/app/lib/actions';




  export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        try {
            const { Id,assistantName, assistantModel, assistantDescription, files, assistantToken, validTopics, invalidTopics} = await req.json();

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
        

            const assistant = await openai.beta.assistants.update(Id,assistantOptions);
            const assistantId = Id
            const data ={
                Id: assistant.id,
                name: assistantName,
                ai: assistantModel,
                token: assistantToken,
                role:assistantDescription,
                fileId: files,
                validTopics: validTopics,
                invalidTopics:invalidTopics
            }
            const actualizar = await updateBot(assistantId,data);
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