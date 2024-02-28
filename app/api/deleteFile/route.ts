import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import bots from "@/bots.json";
import { deleteFile } from '@/app/lib/actions';


export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get('key');
  if (!apiKey) {
    console.log('No API key provided');
    return NextResponse.json({ success: false, message: 'API key is required' });
  }
  const openai = new OpenAI({
    apiKey: apiKey
  });

  const { fileId } = await req.json();
  


  // Check if a file ID was provided in the request
  if (!fileId) {
    console.log('No file ID found in the request');
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // Count how many bots use this fileId
  const usageCount = bots.filter(bot => bot.fileId.includes(fileId)).length;


  // si el fichero es utilizado más de dos bots no es necesario borrarlo
  if (usageCount > 1) {
    return NextResponse.json({ success: true, message: 'Fichero utilizado por más de dos bots.' });
  }

  try {
    // Proceed with file deletion from OpenAI
    console.log(`Starting file deletion from OpenAI, File ID: ${fileId}`);
    const deletionStatus = await openai.files.del(fileId);
    if (deletionStatus.deleted) {
      //eliminar de fichero.json
      const eliminado  = deleteFile(fileId);
      
      
    }
    console.log(`File deleted, ID: ${deletionStatus.id}, Status: ${deletionStatus.deleted}`);

    // Respond with the deletion status
    return NextResponse.json({ success: deletionStatus.deleted, fileId: deletionStatus.id });
  } catch (error) {
    // Log and respond to any errors during the deletion process
    console.error('Error deleting file:', error);
    return NextResponse.json({ success: false, message: 'Error deleting file' }, { status: 500 });
  }
}
