
import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(req as unknown as IncomingMessage, async (err, fields, files) => {
      if (err) {
        reject(NextResponse.json({ error: 'Failed to parse form data.' }, { status: 500 }));
        return;
      }

      try {
        const file = files.file ? files.file[0] : undefined;
        if (!file) {
          resolve(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }));
          return;
        }

        const dataBuffer = fs.readFileSync(file.filepath);
        const data = await pdfParse(dataBuffer);
        resolve(NextResponse.json({ text: data.text }, { status: 200 }));
      } catch (e) {
        console.error('Error in processing the request:', e);
        resolve(NextResponse.json({ error: 'Failed to extract text from PDF.' }, { status: 500 }));
      }
    });
  });
}
