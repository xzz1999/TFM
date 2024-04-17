  import { NextRequest, NextResponse } from 'next/server';
  import { writeFile, mkdir, unlink,  } from 'fs/promises';
  import { createReadStream, existsSync } from 'fs';
  import OpenAI from "openai";
  import crypto from 'crypto';
  import path from 'path';
  import {checkFile,updateFile} from '@/app/lib/actions';



  export async function POST(request: NextRequest) {
    console.log(`Upload API call started`);

    //extraer la clave de cabecera
    const apiKey = request.headers.get('key');
    if (!apiKey) {
      console.log('No API key provided');
      return NextResponse.json({ success: false, message: 'API key is required' });
    }
    //deb
    console.log("inicializando OpenAI")
    // Inicializar OpenAI
    const openai = new OpenAI({
      apiKey: apiKey
    });

    const data = await request.formData();
  
    const file: File | null = data.get('file') as unknown as File;
    //debug
    console.log("file en uploadFile:", file);

    if (!file) {
      console.log('No file found in the request');
      return NextResponse.json({ success: false });
    }

    // comprueba si existe el directorio tmp
    const tmpDir = '/tmp';
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir);
      console.log(`Temporary directory ${tmpDir} created`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pathT = `${tmpDir}/${file.name}`;
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const exist = await checkFile(hash);

    if(exist===null){
  
    await writeFile(pathT, buffer);
    console.log(`File written to ${pathT}`);

    try {
      console.log('Starting file upload to OpenAI');
      const fileForRetrieval = await openai.files.create({
        file: createReadStream(pathT),
        purpose: "assistants",
      });
      console.log(`File uploaded, ID: ${fileForRetrieval.id}`);

        const newData  ={
          ficherohash: hash,
          ficheroId: fileForRetrieval.id,
          ficheroName: file.name
  
        }
        const update = await updateFile(newData);
        if(update){
          console.log("se ha actualizado con exito el fichero json");
        }
        // eliminar fichero en el directorio tmp despues de ser subido
        await unlink(pathT);
        console.log(`File ${pathT} deleted after upload`);

        return NextResponse.json({ success: true, fileId: fileForRetrieval.id });
      } catch (error) {
        console.error('Error uploading file:', error);

      try {
        await unlink(pathT);
        console.log(`File ${path} deleted after error`);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }

      return NextResponse.json({ success: false, message: 'Error uploading file' });
    
    }
  }else{
    return NextResponse.json({ success: true, fileId: exist });

  }
}