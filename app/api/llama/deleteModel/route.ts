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
    const command = `ollama rm ${modelId}`;
    await execPromise(command);
    await deleteBot(modelId);


    
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
