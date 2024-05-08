import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { addBot } from '@/app/lib/actions';

const execPromise = promisify(exec); 

export async function POST(req : NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const { modelName, modelAI, modelDescription, files, modelId } = await req.json();


    const tmpDir = '/tmp';
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir);
      console.log(`Temporary directory ${tmpDir} created`);
    }
    const filePath = path.join(tmpDir, `Modelfile.txt`);

   

    const fileContent = `FROM llama3

# set the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1

# set the system message
SYSTEM """
${modelDescription}
"""`;
    console.log("escribiendo el fichero");
    await writeFile(filePath, fileContent, 'utf-8');
    console.log("fichero escrito con exito");
    
    console.log("creando el modelo")
    const command = `ollama create ${modelId} -f ${filePath}`;
    const { stdout, stderr } = await execPromise(command);

    

    console.log("eliminando el fichero");
    await unlink(filePath);

    const data = {
      Id: modelId,
      name: modelName,
      ai: modelAI,
      role: modelDescription,
      fileId: files
    };

     await addBot(data);  

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
