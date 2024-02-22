import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import OpenAI from "openai";
import crypto from 'crypto';
import path from 'path';



export async function POST(request: NextRequest) {
  console.log(`Upload API call started`);

  // Retrieve the API key from the request headers
  const apiKey = request.headers.get('key');
  if (!apiKey) {
    console.log('No API key provided');
    return NextResponse.json({ success: false, message: 'API key is required' });
  }

  // Initialize the OpenAI client with the provided API key
  const openai = new OpenAI({
    apiKey: apiKey
  });

  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    console.log('No file found in the request');
    return NextResponse.json({ success: false });
  }

  // Check and create tmp directory if it doesn't exist
  const tmpDir = '/tmp';
  const fPath= path.join(process.cwd(),"ficheros.json")
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir);
    console.log(`Temporary directory ${tmpDir} created`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const pathT = `${tmpDir}/${file.name}`;
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    //const data = readFile(fPath,'utf-8');
    //hashes = JSON.parse(data);
    //const hashExists = hashes.some((entry: { ficherohash: string; }) => entry.ficherohash === hash);
    //console.log("hashExists:",hashExists);
 +
 
  await writeFile(pathT, buffer);
  console.log(`File written to ${pathT}`);

  try {
    console.log('Starting file upload to OpenAI');
    const fileForRetrieval = await openai.files.create({
      file: createReadStream(pathT),
      purpose: "assistants",
    });
    console.log(`File uploaded, ID: ${fileForRetrieval.id}`);

    //guardar hashes y nombre en un archivo json
    const data ={
        ficherohash: hash,
        name: file.name
    };
    const jsonString = JSON.stringify(data, null, 2);
    try{    
        writeFile(fPath,jsonString);
        console.log("se ha escrito hash en:",fPath);
    }catch(error){
        console.log("error en escribir hash:",error);
    }
    // Attempt to delete the file after uploading
    await unlink(pathT);
    console.log(`File ${pathT} deleted after upload`);

    return NextResponse.json({ success: true, fileId: fileForRetrieval.id });
  } catch (error) {
    console.error('Error uploading file:', error);

    // Attempt to delete the file in case of an error
    try {
      await unlink(pathT);
      console.log(`File ${path} deleted after error`);
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
    }

    return NextResponse.json({ success: false, message: 'Error uploading file' });
  }
}
