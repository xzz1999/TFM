import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
if (req.method !== 'POST') {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }
  try {
    const { token} = await req.json();
    const response = await fetch('http://localhost:3003/api/createbot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: token })
          });
     const data = await response.json();
     if(data.status === "success"){
        return NextResponse.json({
            status: "success",
          });
     }

    } catch (e: any) { 
    console.error("Error in processing the request:", e);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Error en obtener ai de bot"
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }}
    