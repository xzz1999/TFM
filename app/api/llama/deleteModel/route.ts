import { NextRequest, NextResponse } from 'next/server';
import { deleteBot } from '@/app/lib/actions';
import { promisify } from 'util';
import { exec } from 'child_process';


const execPromise = promisify(exec);  

export async function POST(req : NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { modelId } = await req.json();
    console.log("modelId:", modelId);
    
    console.log("eliminando el modelo")
    const command = `ollama rm ${modelId}`;
    console.log("ejecutando el comando");
    await execPromise(command);
    console.log("borrando el bot de base de datos")
    await deleteBot(modelId);


    console.log("retornando el resultado");
    return NextResponse.json({ 
      message: 'Assistant created successfully' 
  });

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      success: 'false',
      message: "Error in assistant creation process"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
