import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req : NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  try {
    const {url} = await req.json();
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    const textosJuntos = transcript.map(segment => segment.text).join(' ');
    return NextResponse.json({ 
      status: "success",
      text: textosJuntos
  });

  } catch (e) {
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en obtener la transcripcion del video"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
